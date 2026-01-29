import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../common/Input';
import { ConfigEditor } from './ConfigEditor';
import { Experiment, ExperimentConfig } from '../../types/experiment';
import { datasetsApi } from '../../services/api';
import { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Dataset } from '../../types/dataset';

const experimentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  dataset_id: z.string().min(1, 'Dataset is required'),
  config: z.object({
    model_type: z.string(),
    hyperparameters: z.object({
      batch_size: z.number().positive(),
      learning_rate: z.number().positive(),
      num_epochs: z.number().positive(),
    }),
  }),
  tags: z.array(z.string()).optional(),
});

type ExperimentFormData = z.infer<typeof experimentSchema>;

interface ExperimentFormProps {
  onSubmit: (data: Omit<Experiment, 'id' | 'created_at' | 'status'>) => Promise<void>;
  initialData?: Experiment;
}

export interface ExperimentFormRef {
  submit: () => void;
}

export const ExperimentForm = forwardRef<ExperimentFormRef, ExperimentFormProps>(
  ({ onSubmit, initialData }, ref) => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [config, setConfig] = useState<ExperimentConfig>(
    initialData?.config || {
      model_type: 'multimodal_transformer',
      hyperparameters: {
        batch_size: 32,
        learning_rate: 0.001,
        optimizer: 'adamw',
        num_epochs: 100,
        weight_decay: 0.01,
      },
      architecture: {
        hidden_size: 768,
        num_layers: 12,
        num_heads: 12,
      },
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ExperimentFormData>({
    resolver: zodResolver(experimentSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          description: initialData.description,
          dataset_id: initialData.dataset_id,
          config: initialData.config,
          tags: initialData.tags,
        }
      : undefined,
  });

  useEffect(() => {
    datasetsApi.getAll().then((response) => setDatasets(response.data));
  }, []);

  useEffect(() => {
    setValue('config', config);
  }, [config, setValue]);

  const handleFormSubmit = async (data: ExperimentFormData) => {
    await onSubmit({
      ...data,
      config,
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => {
      handleSubmit(handleFormSubmit)();
    },
  }));

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <Input
        label="Name"
        {...register('name')}
        error={errors.name?.message}
      />
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Description
        </label>
        <textarea
          {...register('description')}
          rows={3}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-1">
          Dataset
        </label>
        <select
          {...register('dataset_id')}
          className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select a dataset</option>
          {datasets.map((dataset) => (
            <option key={dataset.id} value={dataset.id}>
              {dataset.name} ({dataset.modality})
            </option>
          ))}
        </select>
        {errors.dataset_id && (
          <p className="mt-1 text-sm text-red-600">{errors.dataset_id.message}</p>
        )}
      </div>
      <ConfigEditor config={config} onChange={setConfig} />
    </form>
  );
});

ExperimentForm.displayName = 'ExperimentForm';
