import React from 'react';
import { Control, Option } from 'components/editing';
import useEntity from 'hooks/useEntity';

export default function SoundwaveControl({ display, active, stageWidth, stageHeight }) {
  const {
    color,
    wavelength,
    lineWidth,
    width,
    height,
    x,
    y,
    smooth,
    rotation,
    opacity,
  } = display.properties;
  const onChange = useEntity(display);

  return (
    <Control label="Soundwave" active={active} display={display} onChange={onChange}>
      <Option label="Color" type="color" name="color" value={color} />
      <Option
        label="Line Width"
        type="number"
        name="lineWidth"
        value={lineWidth}
        min={0}
        max={10}
        withRange
      />
      <Option
        label="Width"
        type="number"
        name="width"
        value={width}
        min={0}
        max={stageWidth * 2}
        withRange
      />
      <Option
        label="Height"
        type="number"
        name="height"
        value={height}
        min={0}
        max={stageHeight}
        withRange
      />
      <Option
        label="X"
        type="number"
        name="x"
        value={x}
        min={-stageWidth}
        max={stageWidth}
        withRange
      />
      <Option
        label="Y"
        type="number"
        name="y"
        value={y}
        min={-stageHeight}
        max={stageHeight}
        withRange
      />
      <Option
        label="Wavelength"
        type="number"
        name="wavelength"
        value={wavelength}
        min={0}
        max={100}
        step={1}
        withRange
      />
      <Option label="Smooth" type="toggle" name="smooth" value={smooth} />
      <Option
        label="Rotation"
        type="number"
        name="rotation"
        value={rotation}
        min={0}
        max={360}
        withRange
        withReactor
      />
      <Option
        label="Opacity"
        type="number"
        name="opacity"
        value={opacity}
        min={0}
        max={1.0}
        step={0.01}
        withRange
        withReactor
      />
    </Control>
  );
}
