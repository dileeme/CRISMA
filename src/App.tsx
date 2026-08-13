import PdbLoader from './components/PdbLoader';
import MoleculeViewer from './components/MoleculeViewer';
import { useStructure } from './hooks/useStructure';

function App() {
  const { atoms, status, error, load } = useStructure();

  return (
    <div className="w-screen h-screen flex flex-col bg-neutral-950">
      <PdbLoader onLoad={load} loading={status === 'loading'} />
      <div className="relative flex-1">
        {status === 'error' && (
          <div className="absolute top-2 left-2 z-10 px-3 py-2 rounded bg-red-900/80 text-red-100 text-sm max-w-md">
            {error}
          </div>
        )}
        {status === 'success' && (
          <div className="absolute top-2 left-2 z-10 px-3 py-2 rounded bg-neutral-900/80 text-neutral-200 text-sm">
            {atoms.length} atoms
          </div>
        )}
        {status === 'idle' && (
          <div className="absolute inset-0 flex items-center justify-center text-neutral-500 text-sm">
            Enter a PDB ID and hit Load
          </div>
        )}
        <MoleculeViewer atoms={atoms} />
      </div>
    </div>
  );
}

export default App;
