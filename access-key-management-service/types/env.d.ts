type EnvType = import('src/utils').EnvType;

declare namespace NodeJS {
  interface ProcessEnv extends EnvType {}
}
