// PURPOSE: This file defines the Show component used to conditionally render content based on loading state.
//          It is used in the ChatGPT component to display a loading state or the actual chat content

// src/components/ChatGPT/Show.tsx
import * as React from 'react'
import { ShowProps } from './interface'

const Show = (props: ShowProps) => {
  const { loading, fallback, children } = props

  return <>{loading ? fallback : children}</>
}

export default Show
