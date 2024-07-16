#version 300 es

precision mediump float;

uniform vec2 u_position;

uniform vec4 u_color;
uniform vec2 u_size;

uniform float u_strokeWidth;
uniform vec4 u_strokeColor;

out vec4 color;

void main() {
  vec2 localPos = gl_FragCoord.xy - u_position;

  if (
    localPos.x < u_strokeWidth ||
    localPos.x > u_size.x - u_strokeWidth ||
    localPos.y < u_strokeWidth ||
    localPos.y > u_size.y - u_strokeWidth
  ) {
    color = u_strokeColor;
  } else {
    color = u_color;
  }
}
