"use client";

import React, { useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';
import { Card, CardContent } from './card';

interface BarcodeDisplayProps {
  value: string;
  productName?: string;
  width?: number;
  height?: number;
  fontSize?: number;
  displayValue?: boolean;
  format?: string;
}

export default function BarcodeDisplay({
  value,
  productName,
  width = 2,
  height = 100,
  fontSize = 14,
  displayValue = true,
  format = "CODE128"
}: BarcodeDisplayProps) {
  const barcodeRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (barcodeRef.current && value) {
      try {
        JsBarcode(barcodeRef.current, value, {
          format: format,
          width: width,
          height: height,
          displayValue: displayValue,
          fontSize: fontSize,
          margin: 10,
          background: "transparent"
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [value, width, height, fontSize, displayValue, format]);

  if (!value) return null;

  return (
    <Card className="w-full max-w-md mx-auto print:shadow-none">
      <CardContent className="p-6 text-center">
        {productName && (
          <div className="mb-2 font-semibold">{productName}</div>
        )}
        <svg ref={barcodeRef} className="w-full"></svg>
      </CardContent>
    </Card>
  );
}
