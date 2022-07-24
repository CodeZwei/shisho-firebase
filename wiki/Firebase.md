### Docs

https://medium.com/firebase-developers/patterns-for-security-with-firebase-group-based-permissions-for-cloud-firestore-72859cdec8f6
https://codechips.me/firebase-authentication-with-svelte/

I've added Firebase Auth, for simple Google logins
I've limited database rules to only logged in users, but this isn't super secure.
I'd like to follow the above article to setup a custom claim for "admin" or "authorized" users

TODO: Fix up firebase firestore rules

# Admin Authentication

It seems like a backend server cannot directly use a client authentication for use against firestore rules. You need to verify and decode the token and implement the permissioning yourself.

https://stackoverflow.com/a/62946422
