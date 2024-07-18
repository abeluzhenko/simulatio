#version 300 es

in vec2 a_position;

uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform vec2 u_origin;
uniform vec2 u_endPosition;
uniform float u_strokeWidth;

void main() {
    vec2 positionDiff = u_endPosition - u_translation;
    float lineLength = length(positionDiff);
    vec2 rotation = positionDiff / lineLength; 

    vec2 scale = vec2(u_strokeWidth, lineLength);

    vec2 scaledPosition = (a_position - u_origin) * scale;
    vec2 rotatedPosition = vec2(
      scaledPosition.x * rotation.y + scaledPosition.y * rotation.x,
      scaledPosition.y * rotation.y - scaledPosition.x * rotation.x
    );

    vec2 position = rotatedPosition + u_translation;
    vec2 zeroToOne = position / u_resolution;
    vec2 zeroToTwo = zeroToOne * 2.0;
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace, 0, 1);
}
