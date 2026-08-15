# Opaque PNG encoding is intentionally separate

UPNG.js 2.1.0 encodes canvas RGBA buffers and may preserve an alpha-capable color type. App-store icons require a physically RGB PNG, so `encodeOpaquePNG` remains a small dedicated encoder for that one contract. General logo/splash compression continues to use UPNG.js.
