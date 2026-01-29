import { useDatasets } from '../hooks/useDatasets';
import { DatasetList } from '../components/datasets/DatasetList';

export const DatasetsPage = () => {
  const { data, isLoading, refetch } = useDatasets();

  return (
    <DatasetList
      datasets={data?.data || []}
      loading={isLoading}
      onRefresh={() => refetch()}
    />
  );
};
