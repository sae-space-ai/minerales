import { useState, useMemo } from 'react';
import { VERIFIED_LAYERS, LAYER_PROFILES, MineralLayer, LayerCategory } from '../lib/layerRegistry';
import { Layers, Search, Star, Filter, Eye, EyeOff } from 'lucide-react';

export default function LayerCatalogPanel() {
  const [layers, setLayers] = useState<MineralLayer[]>(VERIFIED_LAYERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<LayerCategory | 'ALL'>('ALL');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  const categories: { id: LayerCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'Todas', icon: '📋' },
    { id: 'BASE_CARTOGRAPHY', label: 'Cartografía Base', icon: '🗺️' },
    { id: 'ORTHOPHOTO', label: 'Ortofotografía', icon: '🛰️' },
    { id: 'SATELLITE', label: 'Satélites', icon: '🌍' },
    { id: 'GEOLOGY', label: 'Geología', icon: '🪨' },
    { id: 'FIRES', label: 'Incendios', icon: '🔥' },
    { id: 'HYDROGRAPHY', label: 'Hidrografía', icon: '💧' },
    { id: 'CADASTRE', label: 'Catastro', icon: '🏘️' },
    { id: 'VEGETATION', label: 'Vegetación', icon: '🌳' },
    { id: 'MINING', label: 'Minería', icon: '⛏️' },
    { id: 'HISTORICAL', label: 'Históricas', icon: '📜' },
  ];

  const filteredLayers = useMemo(() => {
    return layers.filter(layer => {
      const matchesSearch = searchQuery === '' || 
        layer.officialName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.descriptiveName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        layer.provider.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || layer.category === selectedCategory;
      const matchesFavorite = !showOnlyFavorites || layer.favorite;
      
      return matchesSearch && matchesCategory && matchesFavorite;
    });
  }, [layers, searchQuery, selectedCategory, showOnlyFavorites]);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, enabled: !l.enabled, visible: !l.enabled } : l
    ));
  };

  const toggleFavorite = (id: string) => {
    setLayers(prev => prev.map(l => 
      l.id === id ? { ...l, favorite: !l.favorite } : l
    ));
  };

  const applyProfile = (profileId: keyof typeof LAYER_PROFILES) => {
    const profile = LAYER_PROFILES[profileId];
    setLayers(prev => prev.map(l => ({
      ...l,
      enabled: profile.layerIds.includes(l.id),
      visible: profile.layerIds.includes(l.id),
    })));
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'OPERATIONAL_BOTH': 'bg-green-900/40 text-green-300',
      'DATA_REQUEST_VERIFIED': 'bg-blue-900/40 text-blue-300',
      'METADATA_VERIFIED': 'bg-amber-900/40 text-amber-300',
      'DISCOVERED': 'bg-gray-700/40 text-gray-300',
      'REQUIRES_AUTHORIZATION': 'bg-red-900/40 text-red-300',
      'NO_COVERAGE': 'bg-gray-700/40 text-gray-400',
    };
    return colors[status] || 'bg-gray-700/40 text-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Layers className="w-5 h-5 text-indigo-400" />
        <h2 className="text-xl font-bold text-white">Catálogo de Capas</h2>
        <span className="ml-auto px-2 py-0.5 bg-indigo-900/40 text-indigo-300 rounded text-xs">
          {layers.length} capas registradas
        </span>
      </div>

      {/* Perfiles predefinidos */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Perfiles de Capas
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(LAYER_PROFILES).map(([id, profile]) => (
            <button
              key={id}
              onClick={() => applyProfile(id as keyof typeof LAYER_PROFILES)}
              className="px-3 py-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg text-xs text-gray-300 transition-colors text-left"
            >
              <div className="font-medium">{profile.name}</div>
              <div className="text-[10px] text-gray-500 mt-0.5">{profile.layerIds.length} capas</div>
            </button>
          ))}
        </div>
      </div>

      {/* Búsqueda y filtros */}
      <div className="bg-gray-900 rounded-xl p-5 border border-gray-700">
        <div className="flex gap-2 mb-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, proveedor..."
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500"
            />
          </div>
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`px-3 py-2 rounded-lg text-sm transition-colors ${
              showOnlyFavorites
                ? 'bg-yellow-700/40 text-yellow-200 border border-yellow-600/50'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            <Star className="w-4 h-4" />
          </button>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-700/40 text-indigo-200 border border-indigo-600/50'
                  : 'bg-gray-800/50 text-gray-400 border border-gray-700/50 hover:bg-gray-800'
              }`}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de capas */}
      <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-3 border-b border-gray-700 bg-gray-800/50">
          <div className="text-xs text-gray-400">
            Mostrando {filteredLayers.length} de {layers.length} capas
          </div>
        </div>
        
        <div className="divide-y divide-gray-700 max-h-[600px] overflow-y-auto">
          {filteredLayers.map(layer => (
            <div
              key={layer.id}
              className={`p-4 transition-colors ${
                layer.enabled ? 'bg-indigo-950/10' : 'bg-gray-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Toggle */}
                <button
                  onClick={() => toggleLayer(layer.id)}
                  className={`p-1.5 rounded transition-colors ${
                    layer.enabled
                      ? 'bg-green-700/40 text-green-300'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {layer.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-white truncate">
                      {layer.descriptiveName}
                    </h4>
                    <button
                      onClick={() => toggleFavorite(layer.id)}
                      className={`transition-colors ${
                        layer.favorite ? 'text-yellow-400' : 'text-gray-600 hover:text-gray-400'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-400 mb-2">
                    <span className="text-gray-500">{layer.provider}</span>
                    <span className="mx-1">•</span>
                    <span className="font-mono text-[10px]">{layer.layerType}</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${getStatusBadge(layer.verificationStatus)}`}>
                      {layer.verificationStatus.replace(/_/g, ' ')}
                    </span>
                    
                    {layer.compatibility.leaflet && (
                      <span className="px-1.5 py-0.5 bg-blue-900/30 text-blue-300 rounded text-[10px]">
                        2D
                      </span>
                    )}
                    {layer.compatibility.cesium && (
                      <span className="px-1.5 py-0.5 bg-purple-900/30 text-purple-300 rounded text-[10px]">
                        3D
                      </span>
                    )}
                    {layer.compatibility.microview && (
                      <span className="px-1.5 py-0.5 bg-green-900/30 text-green-300 rounded text-[10px]">
                        1m²
                      </span>
                    )}
                    {layer.temporal.hasTimeDimension && (
                      <span className="px-1.5 py-0.5 bg-amber-900/30 text-amber-300 rounded text-[10px]">
                        ⏱️ Temporal
                      </span>
                    )}
                  </div>

                  {/* Resolution info */}
                  <div className="text-[10px] text-gray-500">
                    {layer.resolution.pixelSize && (
                      <span>Resolución: {layer.resolution.pixelSize}</span>
                    )}
                    {layer.resolution.suitableForMicrocell && (
                      <span className="ml-2 text-green-400">✓ Apto para microceldas</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredLayers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No se encontraron capas con los filtros seleccionados
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
