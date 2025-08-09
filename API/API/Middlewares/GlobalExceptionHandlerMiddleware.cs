
using Data.DTOs;
using FluentValidation;
using Services;
using System.Text.Json;

namespace API.Middlewares
{
    public class GlobalExceptionHandlerMiddleware : IMiddleware
    {
        private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;
        private readonly IHostEnvironment _env;
        private static readonly JsonSerializerOptions _jsonOpts = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,
            WriteIndented = false
        };
        public GlobalExceptionHandlerMiddleware(ILogger<GlobalExceptionHandlerMiddleware> logger, IHostEnvironment env)
        {
            _logger = logger;
            _env = env;
        }
        public async Task InvokeAsync(HttpContext context, RequestDelegate next)
        {
            try
            {
                await next(context);
            }
            catch (OperationCanceledException oce) // client aborted / request cancelled
            {
                _logger.LogWarning(oce, "Request was cancelled. TraceId: {TraceId}", context.TraceIdentifier);
                await WriteResponse(context,
                    statusCode: StatusCodes.Status400BadRequest,
                    userMessage: "The request was canceled by the client.",
                    errors: null,
                    traceId: context.TraceIdentifier);
            }
            catch (BusinessExeption bex)
            {
                _logger.LogInformation(bex, "Business exception. TraceId: {TraceId}", context.TraceIdentifier);

                var errors = bex.BusinessExeptionMessages?.Length > 0
                    ? bex.BusinessExeptionMessages
                    : (string.IsNullOrWhiteSpace(bex.BusinessExeptionMessage) ? new[] { bex.Message } : new[] { bex.BusinessExeptionMessage });

                await WriteResponse(context,
                    statusCode: StatusCodes.Status400BadRequest,
                    userMessage: _env.IsDevelopment() ? errors.FirstOrDefault() ?? "Business error." : "Your request could not be processed.",
                    errors: errors,
                    traceId: context.TraceIdentifier);
            }
            catch (ValidationException vex) // FluentValidation
            {
                _logger.LogInformation(vex, "Validation failed. TraceId: {TraceId}", context.TraceIdentifier);

                var errors = vex.Errors?
                    .Select(e => $"{e.PropertyName}: {e.ErrorMessage}")
                    .ToArray();

                await WriteResponse(context,
                    statusCode: StatusCodes.Status422UnprocessableEntity,
                    userMessage: _env.IsDevelopment() ? "Validation failed." : "Some inputs are invalid.",
                    errors: errors,
                    traceId: context.TraceIdentifier);
            }
            catch (BadHttpRequestException bhre)
            {
                _logger.LogWarning(bhre, "Bad request. TraceId: {TraceId}", context.TraceIdentifier);
                await WriteResponse(context,
                    statusCode: StatusCodes.Status400BadRequest,
                    userMessage: "Bad request.",
                    errors: new[] { _env.IsDevelopment() ? bhre.Message : "Invalid request." },
                    traceId: context.TraceIdentifier);
            }
            catch (Exception ex) // Unhandled
            {
                _logger.LogError(ex, "Unhandled exception. TraceId: {TraceId}", context.TraceIdentifier);

                // رسالة ودّية في الـ Production + traceId
                var userMessage = _env.IsDevelopment()
                    ? ex.Message
                    : "Something went wrong. Please try again later.";

                await WriteResponse(context,
                    statusCode: StatusCodes.Status500InternalServerError,
                    userMessage: userMessage,
                    errors: _env.IsDevelopment() ? new[] { ex.Message } : null,
                    traceId: context.TraceIdentifier);
            }
        }

        private async Task WriteResponse(
           HttpContext context,
           int statusCode,
           string userMessage,
           IEnumerable<string>? errors,
           string traceId)
        {
            if (context.Response.HasStarted)
            {
                _logger.LogWarning("The response has already started, unable to write error response. TraceId: {TraceId}", traceId);
                return;
            }

            // امسح أي هيدرز/بودي سابق
            context.Response.Clear();
            context.Response.StatusCode = statusCode;
            context.Response.ContentType = "application/json";
            context.Response.Headers["X-Trace-Id"] = traceId;

            var payload = new ApiResponse<object>
            {
                Success = false,
                Message = userMessage,
                Data = null,
                Errors = errors?.ToArray()
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(payload, _jsonOpts));
        }
    }
}
