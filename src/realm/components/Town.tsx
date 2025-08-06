import MedievalTownBuilder from './MedievalTownBuilder';

export default function Town({ onBack }: { onBack: () => void }) {
    return <MedievalTownBuilder onBack={onBack} />;
}
