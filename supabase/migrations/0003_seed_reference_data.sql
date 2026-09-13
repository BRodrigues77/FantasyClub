-- Reference data: sports, the current NFL season, and the initial
-- achievement catalog. NBA is seeded but inactive — schema is multi-sport
-- ready, but only NFL is playable in this MVP.

insert into sports (name, slug, icon, active) values
  ('NFL', 'nfl', 'football', true),
  ('NBA', 'nba', 'basketball', false);

insert into seasons (sport_id, name, year, status)
select id, 'NFL 2026', 2026, 'active' from sports where slug = 'nfl';

insert into achievements (slug, name, description, icon) values
  ('champion', 'Campeão', 'Venceu a liga na temporada', 'trophy'),
  ('runner_up', 'Vice-Campeão', 'Terminou em 2º lugar na temporada', 'medal'),
  ('best_campaign', 'Melhor Campanha', 'Melhor retrospecto da temporada regular', 'target'),
  ('top_weekly_score', 'Maior Pontuação da Rodada', 'Maior pontuação em uma única rodada', 'flame'),
  ('win_streak', 'Maior Sequência de Vitórias', 'Maior sequência consecutiva de vitórias', 'zap');
