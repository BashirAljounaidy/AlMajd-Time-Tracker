/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import * as Icons from 'lucide-react';

interface DynamicIconProps extends React.ComponentPropsWithoutRef<'svg'> {
  name: string;
  size?: number | string;
  className?: string;
  id?: string;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, size = 20, className = '', id, ...props }) => {
  // Resolve component dynamically
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Return HelpCircle as a safe fallback
    const Fallback = Icons.HelpCircle;
    return <Fallback size={size} className={className} id={id} {...props} />;
  }

  return <IconComponent size={size} className={className} id={id} {...props} />;
};
