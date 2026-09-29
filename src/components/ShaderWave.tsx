"use client";

import { useEffect, useRef } from "react";

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;
uniform float t;
uniform vec2 m;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

void main(){
  vec2 uv=gl_FragCoord.xy/r;
  float a=r.x/r.y;
  vec2 p=vec2(uv.x*a,uv.y);
  vec3 col=vec3(0.975,0.988,1.0);
  vec3 deep=vec3(0.18,0.55,0.93);
  vec3 sky=vec3(0.45,0.78,1.0);
  vec3 ice=vec3(0.78,0.91,1.0);

  vec2 mp=vec2(m.x*a,m.y);
  col=mix(col,sky,0.16*exp(-length(p-mp)*2.6));
  col=mix(col,vec3(0.72,0.84,1.0),0.22*exp(-length(p-vec2(a*0.85,0.85))*1.8));

  for(int i=0;i<5;i++){
    float fi=float(i);
    float sp=0.22+fi*0.07;
    float y=0.3+fi*0.085
      +0.055*sin(p.x*(1.3+fi*0.35)+t*sp+fi*1.9)
      +0.025*sin(p.x*(3.2-fi*0.2)-t*(sp*1.6)+fi)
      +0.03*(m.y-0.5)*sin(p.x*2.1+t*0.5+fi);
    float d=uv.y-y;
    vec3 wc=mix(deep,ice,fi/4.0);
    float fill=smoothstep(0.015,-0.32,d);
    col=mix(col,wc,fill*(0.2-fi*0.02));
    float line=exp(-abs(d)*(170.0-fi*18.0));
    col=mix(col,vec3(1.0),line*0.6);
    col=mix(col,wc,exp(-abs(d-0.004)*380.0)*0.45);
  }

  col-=(hash(floor(gl_FragCoord.xy))-0.5)*0.008;
  gl_FragColor=vec4(col,1.0);
}`;

export function ShaderWave({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, powerPreference: "low-power" });
    if (!gl) {
      canvas.dataset.fallback = "1";
      return;
    }
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      canvas.dataset.fallback = "1";
      return;
    }
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uM = gl.getUniformLocation(prog, "m");

    const coarse = window.matchMedia("(pointer: coarse), (max-width: 767px)").matches;
    const weak = coarse && (navigator.hardwareConcurrency || 4) <= 4;
    const still = weak || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = window.devicePixelRatio || 1;
    const maxPixels = coarse ? 1_100_000 : 2_400_000;
    const frameMs = 1000 / 61;
    const mouse = { x: 0.3, y: 0.6, tx: 0.3, ty: 0.6 };
    let raf = 0;
    let visible = true;
    let last = 0;
    const start = performance.now();

    const resize = () => {
      const cw = canvas.clientWidth;
      const ch = canvas.clientHeight;
      const scale = Math.min(dpr, Math.sqrt(maxPixels / Math.max(1, cw * ch)));
      const w = Math.max(1, Math.round(cw * scale));
      const h = Math.max(1, Math.round(ch * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    const draw = (now: number) => {
      if (!still && now - last < frameMs) {
        raf = requestAnimationFrame(draw);
        return;
      }
      last = now;
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.1;
      mouse.y += (mouse.ty - mouse.y) * 0.1;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, still ? 8 : (now - start) / 1000);
      gl.uniform2f(uM, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!still && visible && !document.hidden) raf = requestAnimationFrame(draw);
    };

    const onMove = (e: PointerEvent) => {
      const b = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - b.left) / b.width;
      mouse.ty = 1 - (e.clientY - b.top) / b.height;
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(draw);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) kick();
    });
    io.observe(canvas.parentElement ?? canvas);
    if (!coarse) window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", kick);
    window.addEventListener("resize", kick);
    kick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", kick);
      window.removeEventListener("resize", kick);
    };
  }, []);

  return <canvas ref={ref} className={`shader-wave ${className}`} aria-hidden />;
}
