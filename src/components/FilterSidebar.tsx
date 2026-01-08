import React, { useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import CategoryIcon from '@mui/icons-material/Category';
import CloseIcon from '@mui/icons-material/Close';
// Use rsuite Tree (open-source & styled)
import { Tree } from 'rsuite';
import 'rsuite/dist/rsuite-no-reset.min.css';

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
    const mapNode = (n: any): any => {
      const hasChildren = Array.isArray(n.children) && n.children.length > 0;
      const node: any = {
        value: String(n.id),
        label: (
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            py: 0.5,
            color: 'text.primary',
          }}>
            <span>{n.name}</span>
          </Box>
        ),
      };
      if (hasChildren) {
        node.children = n.children.map((c: any) => mapNode(c));
      } else {
        node.isLeaf = true;
      }
      return node;
    };
    return (Array.isArray(productTypes) ? productTypes : [])
      .filter((pt) => !pt.parent_id)
      .map((root) => mapNode(root));
  }, [productTypes]);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'rgba(20, 20, 20, 0.6)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            Filtros
          </Typography>
        </Box>
        {onClearAll && selectedType && (
          <Button 
            size="small" 
            onClick={onClearAll}
            startIcon={<CloseIcon sx={{ fontSize: 16 }} />}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            Limpar
          </Button>
        )}
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 3 }} />

      {/* Categories Section */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <CategoryIcon sx={{ color: 'text.secondary', fontSize: 18 }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
            Categorias
          </Typography>
        </Box>

        {/* All Products Button */}
        <Button
          fullWidth
          variant={selectedType === '' ? 'contained' : 'text'}
          onClick={() => onSelectType('')}
          sx={{
            justifyContent: 'flex-start',
            mb: 1,
            py: 1,
            px: 2,
            borderRadius: 2,
            bgcolor: selectedType === '' ? 'rgba(0,230,118,0.15)' : 'transparent',
            color: selectedType === '' ? 'primary.main' : 'text.secondary',
            fontWeight: selectedType === '' ? 600 : 400,
            border: selectedType === '' ? '1px solid rgba(0,230,118,0.3)' : '1px solid transparent',
            '&:hover': {
              bgcolor: 'rgba(0,230,118,0.1)',
              color: 'primary.main',
            },
          }}
        >
          Todos os Produtos
        </Button>

        {/* Tree View */}
        <Box
          sx={{
            '& .rs-tree': {
              background: 'transparent !important',
            },
            '& .rs-tree-node': {
              color: '#A0A0A0 !important',
              '&:hover': {
                backgroundColor: 'rgba(0,230,118,0.08) !important',
              },
            },
            '& .rs-tree-node-active': {
              backgroundColor: 'rgba(0,230,118,0.15) !important',
              '& .rs-tree-node-label-content': {
                color: '#00E676 !important',
                fontWeight: '600 !important',
              },
            },
            '& .rs-tree-node-label-content': {
              color: '#FAFAFA !important',
              padding: '8px 12px !important',
              borderRadius: '8px !important',
              transition: 'all 0.2s ease !important',
            },
            '& .rs-tree-node-expand-icon-wrapper': {
              color: '#A0A0A0 !important',
            },
            '& .rs-tree-node-expand-icon-wrapper:hover': {
              color: '#00E676 !important',
            },
            '& .rs-tree-indent-line': {
              borderColor: 'rgba(255,255,255,0.1) !important',
            },
          }}
        >
          <Tree
            data={treeData}
            defaultExpandAll
            style={{ background: 'transparent' }}
            value={selectedType || undefined}
            onSelect={(node: any) => onSelectType(node?.value ?? '')}
          />
        </Box>
      </Box>

      {/* Selected Filter Chip */}
      {selectedType && (
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Filtro ativo:
          </Typography>
          <Chip
            label={
              (Array.isArray(productTypes) ? productTypes : [])
                .flatMap((pt: any) => [pt, ...(pt.children || [])])
                .find((pt: any) => String(pt.id) === selectedType)?.name || 'Categoria'
            }
            onDelete={onClearAll}
            sx={{
              bgcolor: 'rgba(0,230,118,0.15)',
              color: 'primary.main',
              border: '1px solid rgba(0,230,118,0.3)',
              fontWeight: 500,
              '& .MuiChip-deleteIcon': {
                color: 'primary.main',
                '&:hover': {
                  color: 'primary.light',
                },
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default FilterSidebar;
