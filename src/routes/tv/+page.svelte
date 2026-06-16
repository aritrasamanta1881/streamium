<script lang="ts">
  import { onMount } from 'svelte';
  import MediaCard from '$lib/components/MediaCard.svelte';
  import MediaFilters from '$lib/components/MediaFilters.svelte';
  import VideoPlayer from '$lib/components/VideoPlayer.svelte';
  import type { TMDBMediaResponse } from '$lib/types/tmdb';

  interface Season {
    season_number: number;
    name: string;
    episode_count: number;
  }

  interface Episode {
    episode_number: number;
    name: string;
    overview: string;
    air_date: string;
    still_path: string | null;
  }

  let shows: TMDBMediaResponse[] = [];
  let loading = true;
  let error: string | null = null;
  let page = 1;
  let totalPages = 1;
  let selectedSort = 'trending';
  let selectedGenre = '';
  let selectedYear = '';
  let selectedShow: TMDBMediaResponse | null = null;
  let selectedSeason: number | undefined;
  let selectedEpisode: number | undefined;
  let seasons: Season[] = [];
  let episodes: Episode[] = [];
  let showEpisodeModal = false;

  // New variables for sorting and searching
  let sortOrder: 'asc' | 'desc' = 'asc';
  let searchQuery = '';

  // Logic to sort and filter episodes
  $: filteredEpisodes = episodes
    .filter(e => 
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.episode_number.toString().includes(searchQuery)
    )
    .sort((a, b) => sortOrder === 'asc' ? a.episode_number - b.episode_number : b.episode_number - a.episode_number);

  // Existing logic remains same...
  async function fetchShows(currentPage = 1, reset = false) {
    loading = true;
    error = null;
    try {
      let url = '/api/tv';
      const params = new URLSearchParams({
        page: currentPage.toString(),
        sort: selectedSort,
        ...(selectedGenre && { genre: selectedGenre }),
        ...(selectedYear && { year: selectedYear })
      });
      const response = await fetch(`${url}?${params}`);
      if (!response.ok) throw new Error('Failed to fetch TV shows');
      const data = await response.json();
      if (reset) shows = data.results;
      else shows = [...shows, ...data.results];
      totalPages = data.total_pages;
    } catch (err) {
      console.error('Error fetching TV shows:', err);
      error = 'Failed to load TV shows';
    } finally {
      loading = false;
    }
  }

  async function fetchSeasons(showId: number) {
    try {
      const response = await fetch(`/api/tv/${showId}/seasons`);
      if (response.ok) {
        const data = await response.json();
        seasons = data.seasons.filter((s: Season) => s.season_number > 0);
        if (seasons.length > 0) await selectSeason(seasons[0].season_number);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  }

  async function selectSeason(seasonNumber: number) {
    selectedSeason = seasonNumber;
    selectedEpisode = undefined;
    searchQuery = ''; // Reset search when season changes
    try {
      const response = await fetch(`/api/tv/${selectedShow?.id}/season/${seasonNumber}`);
      if (response.ok) {
        const data = await response.json();
        episodes = data.episodes;
        if (episodes.length > 0) selectEpisode(episodes[0].episode_number);
      }
    } catch (error) {
      console.error('Error fetching episodes:', error);
    }
  }

  function selectEpisode(episodeNumber: number) {
    selectedEpisode = episodeNumber;
    showEpisodeModal = false;
  }

  function nextEpisode() {
    if (selectedEpisode && episodes.length > 0) {
      const currentIndex = episodes.findIndex(e => e.episode_number === selectedEpisode);
      if (currentIndex !== -1 && currentIndex < episodes.length - 1) {
        selectEpisode(episodes[currentIndex + 1].episode_number);
      } else {
        const currentSeasonIndex = seasons.findIndex(s => s.season_number === selectedSeason);
        if (currentSeasonIndex !== -1 && currentSeasonIndex < seasons.length - 1) {
          selectSeason(seasons[currentSeasonIndex + 1].season_number).then(() => {
            if (episodes.length > 0) selectEpisode(episodes[0].episode_number);
          });
        }
      }
    }
  }

  async function handleFilter(event: CustomEvent<{ sort: string; genre: string; year: string }>) {
    const { sort, genre, year } = event.detail;
    selectedSort = sort; selectedGenre = genre; selectedYear = year;
    page = 1;
    await fetchShows(1, true);
  }

  async function loadMore() {
    if (page < totalPages) { page++; await fetchShows(page); }
  }

  async function handleShowClick(show: TMDBMediaResponse) {
    selectedShow = show;
    await fetchSeasons(show.id);
    showEpisodeModal = true;
  }

  onMount(() => { fetchShows(); });
</script>

<!-- UI Section (Inside the selectedShow logic) -->
<div class="mt-6 border-b border-gray-700 pb-6">
  <div class="flex flex-wrap justify-between items-center mb-4 gap-4">
    <h3 class="text-xl font-bold text-white">Episodes</h3>
    
    <!-- Sort and Search Controls -->
    <div class="flex gap-2">
      <input 
        type="text" 
        placeholder="Search episode..." 
        bind:value={searchQuery}
        class="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 text-sm outline-none focus:border-primary-500"
      />
      <button 
        class="bg-gray-700 text-white px-3 py-1.5 rounded text-sm hover:bg-gray-600"
        on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
      >
        {sortOrder === 'asc' ? 'Oldest First' : 'Latest First'}
      </button>
      <select 
        class="bg-gray-700 text-white px-3 py-1.5 rounded border border-gray-600 text-sm cursor-pointer"
        value={selectedSeason}
        on:change={(e) => selectSeason(Number(e.currentTarget.value))}
      >
        {#each seasons as season}
          <option value={season.season_number}>S{season.season_number}</option>
        {/each}
      </select>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
    {#each filteredEpisodes as episode}
      <button
        type="button"
        class="w-full p-3 rounded-lg text-left transition-all border flex flex-col sm:flex-row items-center sm:items-start gap-4"
        class:border-primary-500={selectedEpisode === episode.episode_number}
        on:click={() => selectEpisode(episode.episode_number)}
      >
        <div class="w-full sm:w-40 h-24 bg-gray-800 rounded overflow-hidden relative border border-gray-700 flex items-center justify-center">
          {#if episode.still_path}
            <img src="https://image.tmdb.org/t/p/w300{episode.still_path}" alt={episode.name} class="w-full h-full object-cover" />
          {/if}
        </div>
        <div class="flex-1">
          <div class="font-semibold text-white">E{episode.episode_number}: {episode.name}</div>
          <p class="text-sm text-gray-400 mt-1 line-clamp-2">{episode.overview}</p>
        </div>
      </button>
    {/each}
  </div>
</div>
<!-- Rest of the code follows... -->
