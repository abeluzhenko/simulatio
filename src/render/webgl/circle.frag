#version 300 es

precision mediump float;

uniform vec2 u_center;
uniform vec4 u_color;
uniform float u_radius;

uniform float u_strokeWidth;
uniform vec4 u_strokeColor;

out vec4 color;

void main() {
  float d = length(gl_FragCoord.xy - u_center);

  if (d <= u_radius) {
    if (d <= u_radius - u_strokeWidth) {
      color = u_color;
    } else {
      color = u_strokeColor;
    }
  } else {
    discard;
  }
}
