import type { PagedAndSortedResultRequestDto } from '@abp/ng.core';

export interface PagedAndFilteredResultRequestDto extends PagedAndSortedResultRequestDto {
  filter?: string;
}
