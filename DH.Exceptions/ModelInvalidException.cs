namespace DH.Exceptions
{
    public sealed class ModelInvalidException(string? message = null, Exception? ex = null) : Exception(message, ex)
    {
    }
}
