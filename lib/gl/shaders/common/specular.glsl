float calculateSpecular(vec4 normalDirection, vec3 lighting, vec3 eye,
                        float intensity) {
  vec3 h = normalize(lighting + eye);
  float specularIntensity = max(dot(normalDirection.xyz, h), 0.0);
  return max(pow(specularIntensity, 20.0), 0.0) * intensity;
}

// clang-format off
#pragma glslify: export(calculateSpecular)
// clang-format on