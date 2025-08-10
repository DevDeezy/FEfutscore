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

      {/* Product Types - pretty collapsible list */}
      <Box sx={{
        backgroundColor: 'background.paper',
        borderRadius: 2,
        border: theme => `1px solid ${theme.palette.divider}`,
        overflow: 'hidden'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Tipos de Produto</Typography>
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 1 }}>
            <Button
              size="small"
              variant={selectedType === '' ? 'contained' : 'outlined'}
              onClick={() => onSelectType('')}
              sx={{ justifyContent: 'flex-start', minWidth: 0, px: 1, borderRadius: 3 }}
            >
              Todos
            </Button>
          </Box>
          {roots.map((root) => (
            <Accordion key={root.id} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, boxShadow: 'none' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography sx={{ fontWeight: 600 }}>{root.name}</Typography>
                {root.base_type && <Chip label={root.base_type} size="small" sx={{ ml: 1 }} />}
              </AccordionSummary>
              <AccordionDetails>
                {(root.children || []).length === 0 ? (
                  <Button
                    size="small"
                    variant={selectedType === String(root.id) ? 'contained' : 'text'}
                    onClick={() => onSelectType(String(root.id))}
                    sx={{ justifyContent: 'flex-start', minWidth: 0, px: 1 }}
                  >
                    {root.name}
                  </Button>
                ) : (
                  <Box>
                    {(root.children || []).map((child: any) => (
                      <Accordion key={child.id} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, ml: 2 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>{child.name}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {(child.children || []).length === 0 ? (
                            <Button
                              size="small"
                              variant={selectedType === String(child.id) ? 'contained' : 'text'}
                              onClick={() => onSelectType(String(child.id))}
                              sx={{ justifyContent: 'flex-start', minWidth: 0, px: 1 }}
                            >
                              {child.name}
                            </Button>
                          ) : (
                            <Box sx={{ ml: 2 }}>
                              {(child.children || []).map((gchild: any) => (
                                <Button
                                  key={gchild.id}
                                  size="small"
                                  variant={selectedType === String(gchild.id) ? 'contained' : 'text'}
                                  onClick={() => onSelectType(String(gchild.id))}
                                  sx={{ justifyContent: 'flex-start', minWidth: 0, px: 1, my: 0.25 }}
                                >
                                  {gchild.name}
                                </Button>
                              ))}
                            </Box>
                          )}
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Box>
    </Paper>
  );
};

export default FilterSidebar;
