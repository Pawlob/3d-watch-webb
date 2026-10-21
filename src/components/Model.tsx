import React from 'react'
import { useGLTF } from '@react-three/drei'
import { modelData } from '../modelData'

export function Model(props: any) {
  const { nodes, materials } = useGLTF(modelData) as any
  return (
    <group {...props} dispose={null}>
      <mesh geometry={nodes.Object_5.geometry} material={nodes.Object_5.material} />
      <mesh geometry={nodes.Object_6.geometry} material={nodes.Object_6.material} />
      <mesh geometry={nodes.Object_7.geometry} material={nodes.Object_7.material} />
      <mesh geometry={nodes.Object_8.geometry} material={nodes.Object_8.material} />
      <mesh geometry={nodes.Object_9.geometry} material={nodes.Object_9.material} />
      <mesh geometry={nodes.Object_11.geometry} material={nodes.Object_11.material} />
      <mesh geometry={nodes.Object_13.geometry} material={nodes.Object_13.material} />
      <mesh geometry={nodes.Object_14.geometry} material={nodes.Object_14.material} />
      <mesh geometry={nodes.Object_15.geometry} material={nodes.Object_15.material} />
      <mesh geometry={nodes.Object_16.geometry} material={nodes.Object_16.material} />
      <mesh geometry={nodes.Object_17.geometry} material={nodes.Object_17.material} />
      <mesh geometry={nodes.Object_19.geometry} material={nodes.Object_19.material} />
      <mesh geometry={nodes.Object_21.geometry} material={nodes.Object_21.material} />
      <mesh geometry={nodes.Object_22.geometry} material={nodes.Object_22.material} />
      <mesh geometry={nodes.Object_23.geometry} material={nodes.Object_23.material} />
      <mesh geometry={nodes.Object_24.geometry} material={nodes.Object_24.material} />
      <mesh geometry={nodes.Object_25.geometry} material={nodes.Object_25.material} />
      <mesh geometry={nodes.Object_27.geometry} material={nodes.Object_27.material} />
      <mesh geometry={nodes.Object_29.geometry} material={nodes.Object_29.material} />
      <mesh geometry={nodes.Object_30.geometry} material={nodes.Object_30.material} />
      <mesh geometry={nodes.Object_31.geometry} material={nodes.Object_31.material} />
      <mesh geometry={nodes.Object_33.geometry} material={nodes.Object_33.material} />
      <mesh geometry={nodes.Object_34.geometry} material={nodes.Object_34.material} />
      <mesh geometry={nodes.Object_36.geometry} material={nodes.Object_36.material} />
      <mesh geometry={nodes.Object_38.geometry} material={nodes.Object_38.material} />
      <mesh geometry={nodes.Object_39.geometry} material={nodes.Object_39.material} />
      <mesh geometry={nodes.Object_40.geometry} material={nodes.Object_40.material} />
      <mesh geometry={nodes.Object_42.geometry} material={nodes.Object_42.material} />
      <mesh geometry={nodes.Object_44.geometry} material={nodes.Object_44.material} />
      <mesh geometry={nodes.Object_46.geometry} material={nodes.Object_46.material} />
      <mesh geometry={nodes.Object_48.geometry} material={nodes.Object_48.material} />
      <mesh geometry={nodes.Object_50.geometry} material={nodes.Object_50.material} />
      <mesh geometry={nodes.Object_51.geometry} material={nodes.Object_51.material} />
      <mesh geometry={nodes.Object_53.geometry} material={nodes.Object_53.material} />
      <mesh geometry={nodes.Object_54.geometry} material={nodes.Object_54.material} />
      <mesh geometry={nodes.Object_56.geometry} material={nodes.Object_56.material} />
      <mesh geometry={nodes.Object_58.geometry} material={nodes.Object_58.material} />
      <mesh geometry={nodes.Object_59.geometry} material={nodes.Object_59.material} />
      <mesh geometry={nodes.Object_60.geometry} material={nodes.Object_60.material} />
      <mesh geometry={nodes.Object_62.geometry} material={nodes.Object_62.material} />
      <mesh geometry={nodes.Object_64.geometry} material={nodes.Object_64.material} />
      <mesh geometry={nodes.Object_66.geometry} material={nodes.Object_66.material} />
    </group>
  )
}

useGLTF.preload(modelData)