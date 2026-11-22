"use client";

import { drawMermaid } from "kinari-md/mermaid";
import { useEffect, useRef } from "react";

/** 変換した HTML を本文の入れ物（.kinari-body）に入れ、中の図を描く */
export function NoteBody({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    return drawMermaid(ref.current);
  }, [html]);

  return <div ref={ref} className="kinari-body" dangerouslySetInnerHTML={{ __html: html }} />;
}
