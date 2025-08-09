namespace Services
{
    public class BusinessExeption : Exception
    {
        public string BusinessExeptionMessage { get; set; }
        public string[] BusinessExeptionMessages { get; set; }

        public BusinessExeption(string message)
            : base($"{message}")
        {
            this.BusinessExeptionMessage = message;
        }
        public BusinessExeption(string[] messages)
         : base($"{messages}")
        {
            this.BusinessExeptionMessages = messages;
        }

    }
}
