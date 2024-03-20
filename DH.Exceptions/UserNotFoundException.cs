namespace DH.Exceptions
{
    public sealed class UserNotFoundException(string? message = null, Exception? ex = null) : Exception(message, ex)
    {
    }
}
