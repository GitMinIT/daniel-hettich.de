namespace DH.Exceptions
{
    public sealed class AuthorizationException(string? message = null, Exception? ex = null) : Exception(message, ex)
    {
    }
}
