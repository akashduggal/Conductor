import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Dataset, Modality } from '../../types/dataset';
import { MODALITIES } from '../../utils/constants';

const datasetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  modality: z.enum(['text', 'image', 'audio', 'video', 'multimodal']),
  size_bytes: z.number().positive('Size must be positive'),
  file_count: z.number().int().positive('File count must be positive'),
  description: z.string().optional(),
});

type DatasetFormData = z.infer<typeof datasetSchema>;

interface DatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Dataset, 'id' | 'created_at'>) => Promise<void>;
  dataset?: Dataset;
}

export const DatasetModal = ({ isOpen, onClose, onSubmit, dataset }: DatasetModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DatasetFormData>({
    resolver: zodResolver(datasetSchema),
    defaultValues: dataset
      ? {
          name: dataset.name,
          modality: dataset.modality,
          size_bytes: dataset.size_bytes,
          file_count: dataset.file_count,
          description: dataset.description,
        }
      : undefined,
  });

  const handleFormSubmit = async (data: DatasetFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
      reset();
      onClose();
    } catch (error) {
      console.error('Error submitting dataset:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={dataset ? 'Edit Dataset' : 'Create Dataset'}
      size="lg"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit(handleFormSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : dataset ? 'Update' : 'Create'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <Input
          label="Name"
          {...register('name')}
          error={errors.name?.message}
        />
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Modality
          </label>
          <select
            {...register('modality')}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {MODALITIES.map((mod) => (
              <option key={mod} value={mod}>
                {mod.charAt(0).toUpperCase() + mod.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Input
          label="Size (bytes)"
          type="number"
          {...register('size_bytes', { valueAsNumber: true })}
          error={errors.size_bytes?.message}
        />
        <Input
          label="File Count"
          type="number"
          {...register('file_count', { valueAsNumber: true })}
          error={errors.file_count?.message}
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
      </form>
    </Modal>
  );
};
