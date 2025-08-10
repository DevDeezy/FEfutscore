import React from 'react';
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
  const roots = (Array.isArray(productTypes) ? productTypes : []).filter((pt) => !pt.parent_id);

  const renderTypeBranch = (node: any, depth: number = 0) => {
    return (
      <Box key={node.id} sx={{ ml: depth * 2, my: 0.5 }}>
        <Button
          size="small"
          variant={selectedType === String(node.id) ? 'contained' : 'text'}
          onClick={() => onSelectType(String(node.id))}
          sx={{ justifyContent: 'flex-start', minWidth: 0, px: 1 }}
        >
          {node.name}
          {node.base_type && (
            <Chip label={node.base_type} size="small" sx={{ ml: 1 }} />
          )}
        </Button>
        {(node.children || []).map((child: any) => renderTypeBranch(child, depth + 1))}
      </Box>
    );
  };

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

      {/* Product Types */}
      <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Tipos de Produto</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 1 }}>
            <Button
              size="small"
              variant={selectedType === '' ? 'contained' : 'text'}
              onClick={() => onSelectType('')}
              sx={{ justifyContent: 'flex-start', minWidth: 0, px: 1 }}
            >
              Todos
            </Button>
          </Box>
          {roots.map((root) => renderTypeBranch(root, 0))}
        </AccordionDetails>
      </Accordion>

      {/* Placeholder for more filters */}
      <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Preço</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            Em breve
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, mt: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Outros</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="text.secondary">
            Em breve
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default FilterSidebar;
