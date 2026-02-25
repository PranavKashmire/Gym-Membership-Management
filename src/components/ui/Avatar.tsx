import React from 'react';
import { getInitials, getAvatarColor, clsx } from '../../utils';

interface AvatarProps {
    firstName: string;
    lastName: string;
    photo?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    online?: boolean;
    className?: string;
}

const sizeMap = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
};

export const Avatar: React.FC<AvatarProps> = ({
    firstName, lastName, photo, size = 'md', online, className
}) => {
    const initials = getInitials(firstName, lastName);
    const gradient = getAvatarColor(firstName + lastName);

    return (
        <div className={clsx('relative flex-shrink-0', className)}>
            {photo ? (
                <img
                    src={photo}
                    alt={`${firstName} ${lastName}`}
                    className={clsx('rounded-full object-cover', sizeMap[size])}
                />
            ) : (
                <div className={clsx(
                    'rounded-full flex items-center justify-center font-semibold text-white bg-gradient-to-br',
                    gradient, sizeMap[size]
                )}>
                    {initials}
                </div>
            )}
            {online !== undefined && (
                <span className={clsx(
                    'absolute bottom-0 right-0 rounded-full border-2 border-white',
                    size === 'xs' ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5',
                    online ? 'bg-emerald-500' : 'bg-gray-400'
                )} />
            )}
        </div>
    );
};
