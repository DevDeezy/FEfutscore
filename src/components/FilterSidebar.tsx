import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Tree from 'rc-tree';
// rc-tree provides styles via css. Depending on bundler, path can differ.
// The base package exports styles under lib/assets.
import 'rc-tree/assets/index.css';

interface FilterSidebarProps {
  productTypes: any[];
  selectedType: string;
  onSelectType: (typeId: string) => void;
  onClearAll?: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  productTypes,
  selectedType,
  onSelectType,
  onClearAll,
}) => {
  const treeData = useMemo(() => {
    const mapNode = (n: any): any => ({
      key: String(n.id),
      title: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <span>{n.name}</span>
          {n.base_type && <Chip label={n.base_type} size="small" />}
        </Box>
      ),
      children: (n.children || []).map((c: any) => mapNode(c)),
    });
    return (Array.isArray(productTypes) ? productTypes : [])
      .filter((pt) => !pt.parent_id)
      .map((root) => mapNode(root));
  }, [productTypes]);

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        borderRadius: 2,
        position: { md: 'sticky' },
        top: { md: 24 },
        maxHeight: { md: 'calc(100vh - 48px)' },
        overflow: { md: 'auto' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="h6">Filtros</Typography>
        {onClearAll && (
          <Button size="small" onClick={onClearAll} color="secondary">
            Limpar
          </Button>
        )}
      </Box>
      <Divider sx={{ mb: 2 }} />

      {/* Product Types - rc-tree (open-source, free) */}
      <Box
        sx={{
          backgroundColor: 'background.paper',
          borderRadius: 2,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          p: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          Tipos de Produto
        </Typography>
        <Box sx={{ mb: 1 }}>
          <Button
            size="small"
            variant={selectedType === '' ? 'contained' : 'outlined'}
            onClick={() => onSelectType('')}
          >
            Todos
          </Button>
        </Box>
        <Tree
          treeData={treeData}
          defaultExpandAll
          selectable
          selectedKeys={selectedType ? [selectedType] : []}
          onSelect={(keys) => {
            const k = Array.isArray(keys) && keys.length > 0 ? String(keys[0]) : '';
            onSelectType(k);
          }}
          virtual={false}
          showLine
          motion={null}
          style={{ background: 'transparent' }}
        />
      </Box>
    </Paper>
  );
};

export default FilterSidebar;
