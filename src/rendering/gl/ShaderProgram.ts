import {vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrUV: number;
  unifView: WebGLUniformLocation;

  unifTime: WebGLUniformLocation;
  unifResolution: WebGLUniformLocation;
  unifCamerapos: WebGLUniformLocation;
  unifTargetpos: WebGLUniformLocation;

  unifModel: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    // Raymarcher only draws a quad in screen space! No other attributes
    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrUV = gl.getAttribLocation(this.prog, "vs_UV");

    // TODO: add other attributes here
    this.unifView   = gl.getUniformLocation(this.prog, "u_View");
    this.unifModel      = gl.getUniformLocation(this.prog, "u_Model");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");
    this.unifTime   = gl.getUniformLocation(this.prog, "iTime");
    this.unifResolution = gl.getUniformLocation(this.prog, "iResolution");
    this.unifCamerapos      = gl.getUniformLocation(this.prog, "u_Camerapos");
    this.unifTargetpos      = gl.getUniformLocation(this.prog, "u_Targetpos");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  // TODO: add functions to modify uniforms
  setTime(time: number) {
    this.use();
    if (this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, time);
    }
  }

  setResolution(resolution: vec4) {
    this.use();
    if (this.unifResolution !== -1) {
      gl.uniform4fv(this.unifResolution, resolution);
    }
  }

  setCamerapos(pos: vec4) {
    this.use();
    if (this.unifCamerapos !== -1) {
      gl.uniform4fv(this.unifCamerapos, pos);
    }
  }

  setTargetpos(pos: vec4) {
    this.use();
    if (this.unifTargetpos !== -1) {
      gl.uniform4fv(this.unifTargetpos, pos);
    }
  }
  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }
    if (this.attrUV != -1 && d.bindUV()) {
      gl.enableVertexAttribArray(this.attrUV);
      gl.vertexAttribPointer(this.attrUV, 2, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
    if (this.attrUV != -1) gl.disableVertexAttribArray(this.attrUV);
  }
};

export default ShaderProgram;
