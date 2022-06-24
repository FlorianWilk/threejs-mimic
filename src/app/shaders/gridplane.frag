  #include <common>

uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;

        #define TIMESCALE 0.125 
        #define TILES 8
        #define COLOR (1.0/255.0*28.0), 1.0/255.0*167.0, 1.0/255.0*232.0

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord.xy / iResolution.xy;
    uv.x *= iResolution.x / iResolution.y;

    float xxs = fragCoord.x - 0.5;
    float yys = fragCoord.y - 0.5;
    float dd = sqrt(pow(xxs, 2.0) + pow(yys, 2.0));
    if(dd > 0.5f) {
        fragColor = vec4(0.0, 0.0, 0.0, 1.0);
        return;
    }
    if(dd > 0.48f) {
        fragColor = vec4(COLOR, 1.0) * 0.10;
        fragColor[3] = 1.0;
        return;
    }

            /*

            if(dd>0.0045f&&dd<0.0050 || dd<0.003 && dd> 0.002){
                fragColor = vec4(COLOR,0.1)*0.3;
                return;
            }
            */

    float s1 = 1.0 / 40.0;
    float s2 = s1 / 5.0;
    float s3 = s2 / 5.0;
    float w1 = 0.00030;
    if(mod(fragCoord.x + w1 / 2.0, s1) < w1 || mod(fragCoord.y + w1 / 2.0, s1) < w1) {
        float fx = mod(fragCoord.x, 0.04);
        float fy = mod(fragCoord.y, 0.04);
        fragColor = vec4(COLOR, 1.0) * 0.2;
        fragColor[3] = 1.0;
        if(fragCoord.y > 0.5 - w1 / 2.0 && fragCoord.y < 0.5 + w1 / 2.0 && fragCoord.x > 0.5 && fragCoord.x < 0.51)
            fragColor = vec4(COLOR, 1.0);
        if(fragCoord.x > 0.5 - w1 / 2.0 && fragCoord.x < 0.5 + w1 / 2.0 && fragCoord.y > 0.5 && fragCoord.y < 0.51)
            fragColor = vec4(1.0, 1.0, 1.0, 1.0);
    } else if(mod(fragCoord.x + 0.00010 / 2.0, s2) < 0.00010 || mod(fragCoord.y + 0.00010 / 2.0, s2) < 0.00010) {
        fragColor = vec4(COLOR, 1.0) * 0.15;
        fragColor[3] = 1.0;

    } else if(mod(fragCoord.x + 0.00002 / 2.0, s3) < 0.00002 || mod(fragCoord.y + 0.00002 / 2.0, s3) < 0.00002) {
        fragColor = vec4(COLOR, 1.0) * 0.10;
        fragColor[3] = 1.0;

    } else {
        fragColor = vec4(0.0, 0.0, 0.0, 0.0);

    }

}

varying vec2 vUv;

void main() {
        //  mainImage(gl_FragColor, gl_FragCoord.xy);
    mainImage(gl_FragColor, vUv * iResolution.xy);
}