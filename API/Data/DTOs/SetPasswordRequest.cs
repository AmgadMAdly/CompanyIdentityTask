namespace Data.DTOs
{
    public class SetPasswordRequest
    {

        public string Email { get; set; }


        public string Password { get; set; }

        public string ConfirmPassword { get; set; }
    }
}
