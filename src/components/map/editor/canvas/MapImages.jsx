import { ImageOverlay } from "react-leaflet";

/** Renderiza as imagens de fundo dos blocos (opacidade definida pelo modo). */
export function MapImages({ imageOverlays }) {
  return imageOverlays.map((img) => (
    <ImageOverlay
      key={`img-${img.id}`}
      url={img.url}
      bounds={img.bounds}
      opacity={img.opacity}
      zIndex={img.zIndex}
    />
  ));
}
