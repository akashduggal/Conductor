import { useState } from 'react';
import { Code, FileText } from 'lucide-react';
import { ExperimentConfig } from '../../types/experiment';
import { Button } from '../common/Button';
import { Input } from '../common/Input';

interface ConfigEditorProps {
  config: ExperimentConfig;
  onChange: (config: ExperimentConfig) => void;
  mode?: 'json' | 'form';
  readOnly?: boolean;
}

export const ConfigEditor = ({
  config,
  onChange,
  mode: initialMode = 'form',
  readOnly = false,
}: ConfigEditorProps) => {
  const [mode, setMode] = useState<'json' | 'form'>(initialMode);
  const [jsonText, setJsonText] = useState(JSON.stringify(config, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleJsonChange = (value: string) => {
    setJsonText(value);
    try {
      const parsed = JSON.parse(value);
      setJsonError(null);
      onChange(parsed);
    } catch (error) {
      setJsonError('Invalid JSON');
    }
  };

  const handleFormChange = (field: string, value: any) => {
    onChange({
      ...config,
      [field]: value,
    });
  };

  const handleHyperparameterChange = (field: string, value: any) => {
    onChange({
      ...config,
      hyperparameters: {
        ...config.hyperparameters,
        [field]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Configuration</h3>
        {!readOnly && (
          <div className="flex items-center gap-2">
            <Button
              variant={mode === 'form' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setMode('form');
                setJsonText(JSON.stringify(config, null, 2));
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Form
            </Button>
            <Button
              variant={mode === 'json' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => {
                setMode('json');
                setJsonText(JSON.stringify(config, null, 2));
              }}
            >
              <Code className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        )}
      </div>

      {mode === 'json' ? (
        <div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            readOnly={readOnly}
            className={`w-full h-96 font-mono text-sm p-4 bg-zinc-800 text-zinc-100 border rounded-lg ${
              jsonError ? 'border-red-500' : 'border-zinc-700'
            } focus:outline-none focus:ring-2 focus:ring-primary-500`}
          />
          {jsonError && <p className="mt-2 text-sm text-red-600">{jsonError}</p>}
        </div>
      ) : (
        <div className="space-y-4 bg-zinc-800/50 p-4 rounded-lg">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">
              Model Type
            </label>
            <Input
              value={config.model_type}
              onChange={(e) => handleFormChange('model_type', e.target.value)}
              readOnly={readOnly}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Batch Size"
              type="number"
              value={config.hyperparameters.batch_size}
              onChange={(e) =>
                handleHyperparameterChange('batch_size', parseInt(e.target.value))
              }
              readOnly={readOnly}
            />
            <Input
              label="Learning Rate"
              type="number"
              step="0.0001"
              value={config.hyperparameters.learning_rate}
              onChange={(e) =>
                handleHyperparameterChange('learning_rate', parseFloat(e.target.value))
              }
              readOnly={readOnly}
            />
            <Input
              label="Optimizer"
              value={config.hyperparameters.optimizer || 'adam'}
              onChange={(e) => handleHyperparameterChange('optimizer', e.target.value)}
              readOnly={readOnly}
            />
            <Input
              label="Number of Epochs"
              type="number"
              value={config.hyperparameters.num_epochs}
              onChange={(e) =>
                handleHyperparameterChange('num_epochs', parseInt(e.target.value))
              }
              readOnly={readOnly}
            />
            {config.hyperparameters.weight_decay !== undefined && (
              <Input
                label="Weight Decay"
                type="number"
                step="0.0001"
                value={config.hyperparameters.weight_decay}
                onChange={(e) =>
                  handleHyperparameterChange('weight_decay', parseFloat(e.target.value))
                }
                readOnly={readOnly}
              />
            )}
          </div>

          {config.architecture && (
            <div className="mt-4 pt-4 border-t border-zinc-700">
              <h4 className="text-sm font-medium text-zinc-300 mb-3">Architecture</h4>
              <div className="grid grid-cols-2 gap-4">
                {config.architecture.hidden_size !== undefined && (
                  <Input
                    label="Hidden Size"
                    type="number"
                    value={config.architecture.hidden_size}
                    onChange={(e) =>
                      handleFormChange('architecture', {
                        ...config.architecture,
                        hidden_size: parseInt(e.target.value),
                      })
                    }
                    readOnly={readOnly}
                  />
                )}
                {config.architecture.num_layers !== undefined && (
                  <Input
                    label="Number of Layers"
                    type="number"
                    value={config.architecture.num_layers}
                    onChange={(e) =>
                      handleFormChange('architecture', {
                        ...config.architecture,
                        num_layers: parseInt(e.target.value),
                      })
                    }
                    readOnly={readOnly}
                  />
                )}
                {config.architecture.num_heads !== undefined && (
                  <Input
                    label="Number of Heads"
                    type="number"
                    value={config.architecture.num_heads}
                    onChange={(e) =>
                      handleFormChange('architecture', {
                        ...config.architecture,
                        num_heads: parseInt(e.target.value),
                      })
                    }
                    readOnly={readOnly}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
