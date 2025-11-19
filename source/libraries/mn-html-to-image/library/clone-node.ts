import type { Options, ICloneCSSStyleOptions } from './types';
import { clonePseudoElements } from './clone-pseudos';
import { createImage, toArray, isInstanceOfElement } from './util';
import { getMimeType } from './mimes';
import { resourceToDataURL } from './dataurl';

async function cloneCanvasElement(canvas: HTMLCanvasElement) {
  const dataURL = canvas.toDataURL();
  if (dataURL === 'data:,') {
    return canvas.cloneNode(false) as HTMLCanvasElement;
  }
  return createImage(dataURL);
}

async function cloneVideoElement(video: HTMLVideoElement, options: Options) {
  if (video.currentSrc) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;
    ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL();
    return createImage(dataURL);
  }

  const poster = video.poster;
  const contentType = getMimeType(poster);
  const dataURL = await resourceToDataURL(poster, contentType, options);
  return createImage(dataURL);
}

async function cloneIFrameElement(iframe: HTMLIFrameElement, cloneCSSStyleOptions: ICloneCSSStyleOptions) {
  try {
    if (iframe?.contentDocument?.body) {
      return (await cloneNode(iframe.contentDocument.body, {}, cloneCSSStyleOptions, true)) as HTMLBodyElement;
    }
  } catch {
    // Failed to clone iframe
  }

  return iframe.cloneNode(false) as HTMLIFrameElement;
}

async function cloneSingleNode<T extends HTMLElement>(
  node: T,
  options: Options,
  cloneCSSStyleOptions: ICloneCSSStyleOptions
): Promise<HTMLElement> {
  if (isInstanceOfElement(node, HTMLCanvasElement)) {
    return cloneCanvasElement(node);
  }

  if (isInstanceOfElement(node, HTMLVideoElement)) {
    return cloneVideoElement(node, options);
  }

  if (isInstanceOfElement(node, HTMLIFrameElement)) {
    return cloneIFrameElement(node, cloneCSSStyleOptions);
  }

  return node.cloneNode(false) as T;
}

const isSlotElement = (node: HTMLElement): node is HTMLSlotElement =>
  node.tagName != null && node.tagName.toUpperCase() === 'SLOT';

async function cloneChildren<T extends HTMLElement>(
  nativeNode: T,
  clonedNode: T,
  options: Options,
  cloneCSSStyleOptions: ICloneCSSStyleOptions
): Promise<T> {
  let children: T[] = [];

  if (isSlotElement(nativeNode) && nativeNode.assignedNodes) {
    children = toArray<T>(nativeNode.assignedNodes());
  } else if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && nativeNode.contentDocument?.body) {
    children = toArray<T>(nativeNode.contentDocument.body.childNodes);
  } else {
    children = toArray<T>((nativeNode.shadowRoot ?? nativeNode).childNodes);
  }

  if (children.length === 0 || isInstanceOfElement(nativeNode, HTMLVideoElement)) {
    return clonedNode;
  }

  await children.reduce(
    (deferred, child) =>
      deferred
        .then(() => cloneNode(child, options, cloneCSSStyleOptions))
        .then((clonedChild: HTMLElement | null) => {
          if (clonedChild) {
            clonedNode.appendChild(clonedChild);
          }
        }),
    Promise.resolve()
  );

  return clonedNode;
}

function cloneCSSStyle<T extends HTMLElement>(nativeNode: T, clonedNode: T, options: ICloneCSSStyleOptions) {
  const targetStyle = clonedNode.style;
  if (!targetStyle) {
    return;
  }

  const sourceStyle = window.getComputedStyle(nativeNode);
  if (sourceStyle.cssText) {
    targetStyle.cssText = sourceStyle.cssText;
    targetStyle.transformOrigin = sourceStyle.transformOrigin;
  } else {
    toArray<string>(sourceStyle).forEach((name) => {
      let value = sourceStyle.getPropertyValue(name);
      /*       if (name === 'font-size' && value.endsWith('px')) {
        const reducedFont =
          Math.floor(parseFloat(value.substring(0, value.length - 2))) - 0.1;
        value = `${reducedFont}px`;
      } */
      if (name === 'font-size' && value.endsWith('px') && options.shrinkFontSize && options.shrinkValue) {
        const reducedFont = options.shrinkAbsolute
          ? Math.floor(parseFloat(value.substring(0, value.length - 2))) - options.shrinkValue
          : parseFloat(value.substring(0, value.length - 2)) - options.shrinkValue;

        value = `${reducedFont}px`;
      }

      if (isInstanceOfElement(nativeNode, HTMLIFrameElement) && name === 'display' && value === 'inline') {
        value = 'block';
      }

      if (name === 'd' && clonedNode.getAttribute('d')) {
        value = `path(${clonedNode.getAttribute('d')})`;
      }

      targetStyle.setProperty(name, value, sourceStyle.getPropertyPriority(name));
    });
  }
}

function cloneInputValue<T extends HTMLElement>(nativeNode: T, clonedNode: T) {
  if (isInstanceOfElement(nativeNode, HTMLTextAreaElement)) {
    clonedNode.innerHTML = nativeNode.value as string;
  }

  if (isInstanceOfElement(nativeNode, HTMLInputElement)) {
    clonedNode.setAttribute('value', nativeNode.value as string);
  }
}

function cloneSelectValue<T extends HTMLElement>(nativeNode: T, clonedNode: T) {
  if (isInstanceOfElement(nativeNode, HTMLSelectElement)) {
    const clonedSelect = clonedNode as unknown as HTMLSelectElement;
    const selectedOption = Array.from(clonedSelect.children).find(
      (child) => nativeNode.value === child.getAttribute('value')
    );

    if (selectedOption) {
      selectedOption.setAttribute('selected', '');
    }
  }
}

function decorate<T extends HTMLElement>(nativeNode: T, clonedNode: T, cloneCSSStyleOptions: ICloneCSSStyleOptions): T {
  if (isInstanceOfElement(clonedNode, Element)) {
    cloneCSSStyle(nativeNode, clonedNode, cloneCSSStyleOptions);
    clonePseudoElements(nativeNode, clonedNode);
    cloneInputValue(nativeNode, clonedNode);
    cloneSelectValue(nativeNode, clonedNode);
  }

  return clonedNode;
}

async function ensureSVGSymbols<T extends HTMLElement>(
  clone: T,
  options: Options,
  cloneCSSStyleOptions: ICloneCSSStyleOptions
) {
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const uses = clone.querySelectorAll ? clone.querySelectorAll('use') : [];
  if (uses.length === 0) {
    return clone;
  }

  const processedDefs: { [key: string]: HTMLElement } = {};
  for (let i = 0; i < uses.length; i++) {
    const use = uses[i]!;
    const id = use.getAttribute('xlink:href');
    if (id) {
      const exist = clone.querySelector(id);
      const definition = document.querySelector(id) as HTMLElement;
      if (!exist && definition && !processedDefs[id]) {
        processedDefs[id] = (await cloneNode(definition, options, cloneCSSStyleOptions, true))!;
      }
    }
  }

  const nodes = Object.values(processedDefs);
  if (nodes.length) {
    const ns = 'http://www.w3.org/1999/xhtml';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('xmlns', ns);
    svg.style.position = 'absolute';
    svg.style.width = '0';
    svg.style.height = '0';
    svg.style.overflow = 'hidden';
    svg.style.display = 'none';

    const defs = document.createElementNS(ns, 'defs');
    svg.appendChild(defs);

    for (let i = 0; i < nodes.length; i++) {
      defs.appendChild(nodes[i]!);
    }

    clone.appendChild(svg);
  }

  return clone;
}

export async function cloneNode<T extends HTMLElement>(
  node: T,
  options: Options,
  cloneCSSStyleOptions: ICloneCSSStyleOptions,
  isRoot?: boolean
): Promise<T | null> {
  if (!isRoot && options.filter && !options.filter(node)) {
    return null;
  }

  return Promise.resolve(node)
    .then((clonedNode) => cloneSingleNode(clonedNode, options, cloneCSSStyleOptions) as Promise<T>)
    .then((clonedNode) => cloneChildren(node, clonedNode, options, cloneCSSStyleOptions))
    .then((clonedNode) => decorate(node, clonedNode, cloneCSSStyleOptions))
    .then((clonedNode) => ensureSVGSymbols(clonedNode, options, cloneCSSStyleOptions));
}
