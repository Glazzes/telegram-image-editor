export const hsl2rgbShaderFunction = `
vec3 hslToRgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float hPrime = h / (PI / 3.0);  // Normalize to [0, 6)
    float x = c * (1.0 - abs(mod(hPrime, 2.0) - 1.0));

    vec3 rgb;

    if (0.0 <= hPrime && hPrime < 1.0) {
        rgb = vec3(c, x, 0.0);
    } else if (1.0 <= hPrime && hPrime < 2.0) {
        rgb = vec3(x, c, 0.0);
    } else if (2.0 <= hPrime && hPrime < 3.0) {
        rgb = vec3(0.0, c, x);
    } else if (3.0 <= hPrime && hPrime < 4.0) {
        rgb = vec3(0.0, x, c);
    } else if (4.0 <= hPrime && hPrime < 5.0) {
        rgb = vec3(x, 0.0, c);
    } else if (5.0 <= hPrime && hPrime < 6.0) {
        rgb = vec3(c, 0.0, x);
    } else {
        rgb = vec3(0.0);
    }

    float m = l - 0.5 * c;
    return rgb + vec3(m);
}
`;
