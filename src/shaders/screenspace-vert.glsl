#version 300 es

precision highp float;

in vec4 vs_Pos;

void main() {
	// TODO: Pass relevant info to fragment
	gl_Position = vs_Pos;
}
