package com.hamitmizrak.token_mail.interfaces;

// Generics
public interface ITokenEmail<T> {

    // CREATE (TOKEN)
    public String createToken(T t);

    // DELETE (TOKEN)
    public void deleteToken(Long id);
}
