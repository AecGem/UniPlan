import * as React from 'react';
import * as IndexApp from '../App.jsx';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return <IndexApp.default />
}