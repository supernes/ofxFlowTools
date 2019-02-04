/**
 *
 * PixelFlow | Copyright (C) 2016 Thomas Diewald - http://thomasdiewald.com
 *
 * A Processing/Java library for high performance GPU-Computing (GLSL).
 * MIT License: https://opensource.org/licenses/MIT
 *
 */


#version 410

precision mediump float;
precision mediump int;

in vec2 texCoordVarying;
out vec2 glFragColor;

uniform sampler2DRect tex_velocity;
uniform sampler2DRect tex_pressure;
uniform sampler2DRect tex_obstacleC;
uniform sampler2DRect tex_obstacleN;

uniform float halfrdx;

void main(){
	
	vec2 posn = texCoordVarying;
	
	float oC = texture(tex_obstacleC, posn).x;
	if (oC == 1.0) {
		glFragColor = vec2(0);
		return;
	}
	
	// pressure
	float pT = textureOffset(tex_pressure, posn, + ivec2(0,1)).x;
	float pB = textureOffset(tex_pressure, posn, - ivec2(0,1)).x;
	float pR = textureOffset(tex_pressure, posn, + ivec2(1,0)).x;
	float pL = textureOffset(tex_pressure, posn, - ivec2(1,0)).x;
	float pC = texture      (tex_pressure, posn).x;
	
	// pure Neumann pressure boundary
	// use center pressure if neighbor is an obstacle
	vec4 oN = texture(tex_obstacleN, posn);
	pT = mix(pT, pC, oN.x);  // if (oT > 0.0) xT = xC;
	pB = mix(pB, pC, oN.y);  // if (oB > 0.0) xB = xC;
	pR = mix(pR, pC, oN.z);  // if (oR > 0.0) xR = xC;
	pL = mix(pL, pC, oN.w);  // if (oL > 0.0) xL = xC;
	
	// gradient subtract
	vec2 grad = halfrdx * vec2(pR - pL, pT - pB);
	vec2 vOld = texture(tex_velocity, posn).xy;
	
	glFragColor = vOld - grad;
}
