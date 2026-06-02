import { Injectable } from '@nestjs/common';
import { WarehouseDbService } from './warehouse-db.service';

interface DateRange {
  from?: string;
  to?: string;
  brandKey?: number;
  vehicleKey?: number;
}

@Injectable()
export class AdminStatsService {
  constructor(private readonly warehouseDb: WarehouseDbService) {}

  async getSummary() {
    const result = await this.warehouseDb.query(
      `
      WITH interaction_totals AS (
        SELECT
          COALESCE(SUM(CASE WHEN interaction_type = 'view' THEN interaction_count ELSE 0 END), 0) AS total_views,
          COALESCE(SUM(CASE WHEN interaction_type = 'favorite' THEN interaction_count ELSE 0 END), 0) AS total_favorites,
          COALESCE(SUM(CASE WHEN interaction_type = 'compare' THEN interaction_count ELSE 0 END), 0) AS total_comparisons
        FROM fact_interactions
      ),
      top_brand AS (
        SELECT brand_name
        FROM vw_brand_popularity
        ORDER BY popularity_score DESC
        LIMIT 1
      ),
      top_vehicle AS (
        SELECT v.model
        FROM dim_vehicles v
        LEFT JOIN fact_interactions fi ON fi.vehicle_key = v.vehicle_key
        LEFT JOIN fact_credit_simulations fcs ON fcs.vehicle_key = v.vehicle_key
        GROUP BY v.vehicle_key, v.model
        ORDER BY
          COALESCE(SUM(fi.interaction_count), 0) + COUNT(fcs.simulation_key) * 5 DESC
        LIMIT 1
      )
      SELECT
        (SELECT COUNT(*) FROM dim_users)::int AS "totalUsers",
        (SELECT COUNT(*) FROM dim_brands)::int AS "totalBrands",
        (SELECT COUNT(*) FROM dim_vehicles)::int AS "totalVehicles",
        it.total_views::int AS "totalViews",
        it.total_favorites::int AS "totalFavorites",
        it.total_comparisons::int AS "totalComparisons",
        (SELECT COUNT(*) FROM fact_credit_simulations)::int AS "totalCreditSimulations",
        (SELECT brand_name FROM top_brand) AS "topBrand",
        (SELECT model FROM top_vehicle) AS "topVehicle"
      FROM interaction_totals it
      `,
    );
    return result.rows[0];
  }

  async getBrandPopularity() {
    const result = await this.warehouseDb.query(
      `
      SELECT
        brand_key AS "brandKey",
        brand_name AS "brandName",
        total_views::int AS "totalViews",
        total_comparisons::int AS "totalComparisons",
        total_favorites::int AS "totalFavorites",
        total_credit_simulations::int AS "totalCreditSimulations",
        popularity_score::numeric AS "popularityScore"
      FROM vw_brand_popularity
      ORDER BY popularity_score DESC, brand_name ASC
      `,
    );
    return result.rows;
  }

  async getVehiclePopularity() {
    const result = await this.warehouseDb.query(
      `
      SELECT
        v.vehicle_key AS "vehicleKey",
        b.brand_key AS "brandKey",
        v.model,
        b.brand_name AS "brandName",
        v.type,
        v.price,
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'view' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalViews",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'compare' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalComparisons",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'favorite' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalFavorites",
        COUNT(DISTINCT fcs.simulation_key)::int AS "totalCreditSimulations",
        (
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'view' THEN fi.interaction_count ELSE 0 END), 0) * 1 +
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'compare' THEN fi.interaction_count ELSE 0 END), 0) * 3 +
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'favorite' THEN fi.interaction_count ELSE 0 END), 0) * 4 +
          COUNT(DISTINCT fcs.simulation_key) * 5
        ) AS "popularityScore"
      FROM dim_vehicles v
      LEFT JOIN dim_brands b ON b.brand_key = v.brand_key
      LEFT JOIN fact_interactions fi ON fi.vehicle_key = v.vehicle_key
      LEFT JOIN fact_credit_simulations fcs ON fcs.vehicle_key = v.vehicle_key
      GROUP BY v.vehicle_key, v.model, b.brand_key, b.brand_name, v.type, v.price
      ORDER BY "popularityScore" DESC, v.model ASC
      `,
    );
    return result.rows;
  }

  async getCreditSimulations() {
    const summary = await this.warehouseDb.query(
      `
      SELECT
        COUNT(*)::int AS "totalSimulations",
        COALESCE(AVG(vehicle_price), 0) AS "averageVehiclePrice",
        COALESCE(AVG(down_payment), 0) AS "averageDownPayment",
        COALESCE(AVG(amount_financed), 0) AS "averageFinancedAmount",
        COALESCE(AVG(estimated_monthly_payment), 0) AS "averageMonthlyPayment"
      FROM fact_credit_simulations
      `,
    );

    const byBrand = await this.warehouseDb.query(
      `
      SELECT
        b.brand_name AS "brandName",
        COUNT(*)::int AS "totalSimulations",
        COALESCE(AVG(fcs.amount_financed), 0) AS "averageFinancedAmount"
      FROM fact_credit_simulations fcs
      JOIN dim_brands b ON b.brand_key = fcs.brand_key
      GROUP BY b.brand_name
      ORDER BY "totalSimulations" DESC, b.brand_name ASC
      `,
    );

    const byVehicle = await this.warehouseDb.query(
      `
      SELECT
        v.model,
        b.brand_name AS "brandName",
        COUNT(*)::int AS "totalSimulations",
        COALESCE(AVG(fcs.estimated_monthly_payment), 0) AS "averageMonthlyPayment"
      FROM fact_credit_simulations fcs
      JOIN dim_vehicles v ON v.vehicle_key = fcs.vehicle_key
      LEFT JOIN dim_brands b ON b.brand_key = v.brand_key
      GROUP BY v.model, b.brand_name
      ORDER BY "totalSimulations" DESC, v.model ASC
      `,
    );

    return {
      ...summary.rows[0],
      byBrand: byBrand.rows,
      byVehicle: byVehicle.rows,
    };
  }

  async getInteractionsOverTime(range: DateRange) {
    const params = [
      range.from ?? null,
      range.to ?? null,
      range.brandKey ?? null,
      range.vehicleKey ?? null,
    ];
    const result = await this.warehouseDb.query(
      `
      WITH filtered_interactions AS (
        SELECT *
        FROM fact_interactions
        WHERE ($3::bigint IS NULL OR brand_key = $3::bigint)
          AND ($4::bigint IS NULL OR vehicle_key = $4::bigint)
      ),
      filtered_credit_simulations AS (
        SELECT *
        FROM fact_credit_simulations
        WHERE ($3::bigint IS NULL OR brand_key = $3::bigint)
          AND ($4::bigint IS NULL OR vehicle_key = $4::bigint)
      )
      SELECT
        d.full_date AS "date",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'view' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalViews",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'favorite' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalFavorites",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'compare' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalComparisons",
        COUNT(DISTINCT fcs.simulation_key)::int AS "totalCreditSimulations"
      FROM dim_date d
      LEFT JOIN filtered_interactions fi ON fi.date_key = d.date_key
      LEFT JOIN filtered_credit_simulations fcs ON fcs.date_key = d.date_key
      WHERE ($1::date IS NULL OR d.full_date >= $1::date)
        AND ($2::date IS NULL OR d.full_date <= $2::date)
      GROUP BY d.full_date
      ORDER BY d.full_date ASC
      `,
      params,
    );
    return result.rows;
  }

  async getVehicleTypePreferences() {
    const result = await this.warehouseDb.query(
      `
      SELECT
        COALESCE(NULLIF(TRIM(v.type), ''), 'unknown') AS type,
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'view' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalViews",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'compare' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalComparisons",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'favorite' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalFavorites",
        COUNT(DISTINCT fcs.simulation_key)::int AS "totalCreditSimulations",
        (
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'view' THEN fi.interaction_count ELSE 0 END), 0) * 1 +
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'compare' THEN fi.interaction_count ELSE 0 END), 0) * 3 +
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'favorite' THEN fi.interaction_count ELSE 0 END), 0) * 4 +
          COUNT(DISTINCT fcs.simulation_key) * 5
        ) AS "popularityScore"
      FROM dim_vehicles v
      LEFT JOIN fact_interactions fi ON fi.vehicle_key = v.vehicle_key
      LEFT JOIN fact_credit_simulations fcs ON fcs.vehicle_key = v.vehicle_key
      GROUP BY COALESCE(NULLIF(TRIM(v.type), ''), 'unknown')
      ORDER BY "popularityScore" DESC, type ASC
      `,
    );
    return result.rows;
  }

  async getUserActivity() {
    const result = await this.warehouseDb.query(
      `
      SELECT
        u.user_key AS "userKey",
        u.name,
        u.email,
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'view' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalViews",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'favorite' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalFavorites",
        COALESCE(SUM(CASE WHEN fi.interaction_type = 'compare' THEN fi.interaction_count ELSE 0 END), 0)::int AS "totalComparisons",
        COUNT(DISTINCT fcs.simulation_key)::int AS "totalCreditSimulations",
        MAX(COALESCE(fi.event_timestamp, fcs.simulated_at)) AS "lastInteractionDate"
      FROM dim_users u
      LEFT JOIN fact_interactions fi ON fi.user_key = u.user_key
      LEFT JOIN fact_credit_simulations fcs ON fcs.user_key = u.user_key
      GROUP BY u.user_key, u.name, u.email
      ORDER BY
        (
          COALESCE(SUM(fi.interaction_count), 0) +
          COUNT(DISTINCT fcs.simulation_key) * 5
        ) DESC,
        u.email ASC
      `,
    );
    return result.rows;
  }

  async getBusinessInsights() {
    const funnel = await this.warehouseDb.query(
      `
      SELECT 'Vistas' AS stage, COALESCE(SUM(interaction_count), 0)::int AS total, 1 AS sort_order
      FROM fact_interactions
      WHERE interaction_type = 'view'
      UNION ALL
      SELECT 'Comparaciones' AS stage, COALESCE(SUM(interaction_count), 0)::int AS total, 2 AS sort_order
      FROM fact_interactions
      WHERE interaction_type = 'compare'
      UNION ALL
      SELECT 'Favoritos' AS stage, COALESCE(SUM(interaction_count), 0)::int AS total, 3 AS sort_order
      FROM fact_interactions
      WHERE interaction_type = 'favorite'
      UNION ALL
      SELECT 'Creditos' AS stage, COUNT(*)::int AS total, 4 AS sort_order
      FROM fact_credit_simulations
      ORDER BY sort_order
      `,
    );

    const conversionByBrand = await this.warehouseDb.query(
      `
      WITH interactions AS (
        SELECT
          brand_key,
          COALESCE(SUM(CASE WHEN interaction_type = 'view' THEN interaction_count ELSE 0 END), 0) AS total_views,
          COALESCE(SUM(CASE WHEN interaction_type = 'favorite' THEN interaction_count ELSE 0 END), 0) AS total_favorites,
          COALESCE(SUM(CASE WHEN interaction_type = 'compare' THEN interaction_count ELSE 0 END), 0) AS total_comparisons
        FROM fact_interactions
        GROUP BY brand_key
      ),
      credits AS (
        SELECT brand_key, COUNT(*) AS total_credit_simulations
        FROM fact_credit_simulations
        GROUP BY brand_key
      )
      SELECT
        b.brand_key AS "brandKey",
        b.brand_name AS "brandName",
        COALESCE(i.total_views, 0)::int AS "totalViews",
        COALESCE(i.total_comparisons, 0)::int AS "totalComparisons",
        COALESCE(i.total_favorites, 0)::int AS "totalFavorites",
        COALESCE(c.total_credit_simulations, 0)::int AS "totalCreditSimulations",
        ROUND(
          COALESCE(c.total_credit_simulations, 0)::numeric /
          NULLIF(COALESCE(i.total_views, 0), 0) * 100,
          2
        ) AS "viewToCreditRate",
        ROUND(
          COALESCE(c.total_credit_simulations, 0)::numeric /
          NULLIF(COALESCE(i.total_favorites, 0), 0) * 100,
          2
        ) AS "favoriteToCreditRate"
      FROM dim_brands b
      LEFT JOIN interactions i ON i.brand_key = b.brand_key
      LEFT JOIN credits c ON c.brand_key = b.brand_key
      ORDER BY "viewToCreditRate" DESC NULLS LAST, "totalCreditSimulations" DESC, b.brand_name ASC
      LIMIT 8
      `,
    );

    const priceRangeInsights = await this.warehouseDb.query(
      `
      WITH vehicle_ranges AS (
        SELECT
          vehicle_key,
          CASE
            WHEN price IS NULL THEN 'Sin precio'
            WHEN price < 50000000 THEN 'Menos de 50M'
            WHEN price < 100000000 THEN '50M - 100M'
            WHEN price < 150000000 THEN '100M - 150M'
            ELSE '150M+'
          END AS price_range,
          CASE
            WHEN price IS NULL THEN 5
            WHEN price < 50000000 THEN 1
            WHEN price < 100000000 THEN 2
            WHEN price < 150000000 THEN 3
            ELSE 4
          END AS sort_order
        FROM dim_vehicles
      ),
      interactions AS (
        SELECT
          vr.price_range,
          vr.sort_order,
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'view' THEN fi.interaction_count ELSE 0 END), 0) AS total_views,
          COALESCE(SUM(CASE WHEN fi.interaction_type = 'favorite' THEN fi.interaction_count ELSE 0 END), 0) AS total_favorites
        FROM vehicle_ranges vr
        LEFT JOIN fact_interactions fi ON fi.vehicle_key = vr.vehicle_key
        GROUP BY vr.price_range, vr.sort_order
      ),
      credits AS (
        SELECT
          vr.price_range,
          COUNT(fcs.simulation_key) AS total_credit_simulations,
          COALESCE(AVG(fcs.estimated_monthly_payment), 0) AS average_monthly_payment
        FROM vehicle_ranges vr
        LEFT JOIN fact_credit_simulations fcs ON fcs.vehicle_key = vr.vehicle_key
        GROUP BY vr.price_range
      )
      SELECT
        i.price_range AS "priceRange",
        i.total_views::int AS "totalViews",
        i.total_favorites::int AS "totalFavorites",
        COALESCE(c.total_credit_simulations, 0)::int AS "totalCreditSimulations",
        COALESCE(c.average_monthly_payment, 0) AS "averageMonthlyPayment"
      FROM interactions i
      LEFT JOIN credits c ON c.price_range = i.price_range
      ORDER BY i.sort_order
      `,
    );

    const leadScores = await this.warehouseDb.query(
      `
      WITH user_interactions AS (
        SELECT
          user_key,
          COALESCE(SUM(CASE WHEN interaction_type = 'view' THEN interaction_count ELSE 0 END), 0) AS total_views,
          COALESCE(SUM(CASE WHEN interaction_type = 'compare' THEN interaction_count ELSE 0 END), 0) AS total_comparisons,
          COALESCE(SUM(CASE WHEN interaction_type = 'favorite' THEN interaction_count ELSE 0 END), 0) AS total_favorites,
          MAX(event_timestamp) AS last_interaction_at
        FROM fact_interactions
        GROUP BY user_key
      ),
      user_credits AS (
        SELECT
          user_key,
          COUNT(*) AS total_credit_simulations,
          MAX(simulated_at) AS last_credit_at
        FROM fact_credit_simulations
        GROUP BY user_key
      ),
      brand_interest AS (
        SELECT DISTINCT ON (user_key)
          user_key,
          brand_name AS top_brand
        FROM (
          SELECT
            fi.user_key,
            b.brand_name,
            SUM(fi.interaction_count) AS interaction_total
          FROM fact_interactions fi
          LEFT JOIN dim_brands b ON b.brand_key = fi.brand_key
          GROUP BY fi.user_key, b.brand_name
        ) ranked
        ORDER BY user_key, interaction_total DESC, brand_name ASC
      )
      SELECT
        u.user_key AS "userKey",
        u.name,
        u.email,
        COALESCE(ui.total_views, 0)::int AS "totalViews",
        COALESCE(ui.total_comparisons, 0)::int AS "totalComparisons",
        COALESCE(ui.total_favorites, 0)::int AS "totalFavorites",
        COALESCE(uc.total_credit_simulations, 0)::int AS "totalCreditSimulations",
        (
          COALESCE(ui.total_views, 0) * 1 +
          COALESCE(ui.total_comparisons, 0) * 3 +
          COALESCE(ui.total_favorites, 0) * 4 +
          COALESCE(uc.total_credit_simulations, 0) * 5
        )::int AS "leadScore",
        bi.top_brand AS "topBrand",
        GREATEST(ui.last_interaction_at, uc.last_credit_at) AS "lastInteractionDate"
      FROM dim_users u
      LEFT JOIN user_interactions ui ON ui.user_key = u.user_key
      LEFT JOIN user_credits uc ON uc.user_key = u.user_key
      LEFT JOIN brand_interest bi ON bi.user_key = u.user_key
      ORDER BY "leadScore" DESC, "lastInteractionDate" DESC NULLS LAST
      LIMIT 8
      `,
    );

    const nonConvertingVehicles = await this.warehouseDb.query(
      `
      WITH vehicle_views AS (
        SELECT vehicle_key, COALESCE(SUM(interaction_count), 0) AS total_views
        FROM fact_interactions
        WHERE interaction_type = 'view'
        GROUP BY vehicle_key
      ),
      vehicle_credits AS (
        SELECT vehicle_key, COUNT(*) AS total_credit_simulations
        FROM fact_credit_simulations
        GROUP BY vehicle_key
      )
      SELECT
        v.vehicle_key AS "vehicleKey",
        v.model,
        b.brand_name AS "brandName",
        COALESCE(vv.total_views, 0)::int AS "totalViews",
        COALESCE(vc.total_credit_simulations, 0)::int AS "totalCreditSimulations",
        ROUND(
          COALESCE(vc.total_credit_simulations, 0)::numeric /
          NULLIF(COALESCE(vv.total_views, 0), 0) * 100,
          2
        ) AS "viewToCreditRate",
        (COALESCE(vv.total_views, 0) - COALESCE(vc.total_credit_simulations, 0) * 3)::int AS "opportunityScore"
      FROM dim_vehicles v
      LEFT JOIN dim_brands b ON b.brand_key = v.brand_key
      LEFT JOIN vehicle_views vv ON vv.vehicle_key = v.vehicle_key
      LEFT JOIN vehicle_credits vc ON vc.vehicle_key = v.vehicle_key
      WHERE COALESCE(vv.total_views, 0) > 0
      ORDER BY "opportunityScore" DESC, "totalViews" DESC
      LIMIT 8
      `,
    );

    return {
      funnel: funnel.rows,
      conversionByBrand: conversionByBrand.rows,
      priceRangeInsights: priceRangeInsights.rows,
      leadScores: leadScores.rows,
      nonConvertingVehicles: nonConvertingVehicles.rows,
    };
  }
}
