'use client';

import { UserRole } from '@/lib/types';

interface RoleSelectorProps {
  selectedRole: UserRole | null;
  onSelect: (role: UserRole) => void;
  disabled?: boolean;
}

const roles: { value: UserRole; label: string; description: string; icon: string }[] = [
  {
    value: 'tenant',
    label: 'Tenant',
    description: 'Looking for a place to rent',
    icon: '🏠',
  },
  {
    value: 'landlord',
    label: 'Landlord',
    description: 'I own properties to rent out',
    icon: '🏢',
  },
  {
    value: 'agent',
    label: 'Agent',
    description: 'I help connect tenants and landlords',
    icon: '🤝',
  },
];

export default function RoleSelector({ selectedRole, onSelect, disabled }: RoleSelectorProps) {
  return (
    <div className="space-y-3">
      {roles.map((role) => (
        <button
          key={role.value}
          onClick={() => onSelect(role.value)}
          disabled={disabled}
          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
            selectedRole === role.value
              ? 'border-green-500 bg-green-50'
              : 'border-gray-300 hover:border-green-300 bg-white'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-start gap-3">
            <div className="text-3xl">{role.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-gray-900">{role.label}</h3>
              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
            </div>
            {selectedRole === role.value && (
              <div className="text-green-500 text-xl">✓</div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

