'use client';

import { Amplify } from 'aws-amplify';
import { amplifyConfig } from './cognito';

Amplify.configure(amplifyConfig, { ssr: true });

export default function AmplifyConfigClient() {
  return null;
}
