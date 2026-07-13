// The "AAA visual" asks that are genuinely achievable in a browser engine:
// bloom, ambient occlusion, tone mapping, and antialiasing are built-in
// Babylon pipelines, not something requiring custom render-engine work.
import { DefaultRenderingPipeline, SSAO2RenderingPipeline } from "@babylonjs/core";

export function setupPostProcessing(scene, camera) {
  const pipeline = new DefaultRenderingPipeline("default", true, scene, [camera]);
  pipeline.bloomEnabled = true;
  pipeline.bloomThreshold = 0.7;
  pipeline.bloomWeight = 0.4;
  pipeline.bloomKernel = 64;
  pipeline.fxaaEnabled = true;
  pipeline.samples = 4;
  pipeline.imageProcessing.toneMappingEnabled = true;
  pipeline.imageProcessing.toneMappingType = 1; // ACES-ish filmic tone mapping
  pipeline.imageProcessing.exposure = 1.1;
  pipeline.imageProcessing.contrast = 1.15;
  pipeline.grainEnabled = true;
  pipeline.grain.intensity = 6;
  pipeline.sharpenEnabled = true;
  pipeline.sharpen.edgeAmount = 0.2;

  const ssao = new SSAO2RenderingPipeline("ssao", scene, { ssaoRatio: 0.75, blurRatio: 1 }, [camera]);
  ssao.radius = 2;
  ssao.totalStrength = 1.2;
  ssao.expensiveBlur = true;
  ssao.samples = 16;

  return { pipeline, ssao };
}
