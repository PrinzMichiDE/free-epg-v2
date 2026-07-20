/** Bump when EPG merge/normalization output changes and cached files must refresh. */
export const EPG_OUTPUT_VERSION = 2;

export const EPG_GENERATOR_NAME = `FreeEPG/${EPG_OUTPUT_VERSION}`;

export function isCurrentEpgOutput(xml: string): boolean {
  return xml.includes(`generator-info-name="${EPG_GENERATOR_NAME}"`);
}
