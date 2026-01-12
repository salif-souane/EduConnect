import { Construction } from 'lucide-react';

interface PlaceholderViewProps {
  title: string;
}

export default function PlaceholderView({ title }: PlaceholderViewProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
        <Construction className="w-8 h-8 text-blue-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
        {title.replace('-', ' ')}
      </h2>
      <p className="text-gray-600">
        Cette fonctionnalité est en cours de développement et sera bientôt disponible.
      </p>
    </div>
  );
}
