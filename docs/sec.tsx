/**

@see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/verify

```
kp= await window.crypto.subtle
  .generateKey(
    {
      name: "ECDSA",
      namedCurve: "P-384",
    },
    true,
    ["sign", "verify"],
  )

exported = await window.crypto.subtle.exportKey("jwk", kp.publicKey);

s= JSON.stringify(exported)
s.length // 214

txt= (new TextEncoder().encode('hola'))

sig= await crypto.subtle.sign({
    name: "ECDSA",
    hash: { name: "SHA-384" },
  }, kp.privateKey, txt)
// 96bytes

await crypto.subtle.verify({
    name: "ECDSA",
    hash: { name: "SHA-384" },
  }, kp.publicKey, sig, txt)
```

@module
*/
