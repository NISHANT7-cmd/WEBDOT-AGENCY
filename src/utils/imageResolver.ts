import { Project } from '../types';

/**
 * Normalizes a URL to ensure it starts with http:// or https://
 */
export const getSafeUrl = (url: string): string => {
  if (!url || url === '#') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  return `https://${trimmed}`;
};

/**
 * Resolves the showcase image for a project.
 * If the project's image source is set to 'screenshot' or if the project has a valid liveUrl 
 * and no custom image has been provided (meaning it is still using the default placeholder),
 * it returns a dynamic screenshot of the live website.
 * Otherwise, it returns the provided custom image URL or design preset.
 */
export const resolveProjectImage = (project: Partial<Project>): string => {
  if (!project) return '';

  const liveUrl = project.liveUrl ? getSafeUrl(project.liveUrl) : '';
  const defaultPlaceholder = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80";
  
  // Clean checks
  const hasLiveUrl = liveUrl && liveUrl !== '#' && !liveUrl.includes('webdot.agency');
  const isDefaultPlaceholder = !project.image || project.image === defaultPlaceholder;
  
  // If explicitly configured for screenshot, or if we have a live URL and only the default placeholder is set
  const useScreenshot = project.imageSource === 'screenshot' || (hasLiveUrl && isDefaultPlaceholder);

  if (useScreenshot && liveUrl) {
    // We use Microlink API to take high-fidelity screenshots of the live website dynamically
    return `https://api.microlink.io/?url=${encodeURIComponent(liveUrl)}&screenshot=true&embed=screenshot.url`;
  }

  return project.image || defaultPlaceholder;
};
