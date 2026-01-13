import mysql from 'mysql2/promise';

const DATABASE_URL = process.env.DATABASE_URL;

async function main() {
  const conn = await mysql.createConnection(DATABASE_URL);

  // Create commercial_banks table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS commercial_banks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      nameAr VARCHAR(255),
      acronym VARCHAR(50),
      swiftCode VARCHAR(20),
      licenseNumber VARCHAR(100),
      bankType ENUM('commercial', 'islamic', 'specialized', 'microfinance') NOT NULL,
      jurisdiction ENUM('aden', 'sanaa', 'both') NOT NULL,
      ownership ENUM('state', 'private', 'mixed', 'foreign') DEFAULT 'private' NOT NULL,
      operationalStatus ENUM('operational', 'limited', 'distressed', 'suspended', 'liquidation') DEFAULT 'operational' NOT NULL,
      sanctionsStatus ENUM('none', 'ofac', 'un', 'eu', 'multiple') DEFAULT 'none' NOT NULL,
      totalAssets DECIMAL(20, 2),
      capitalAdequacyRatio DECIMAL(5, 2),
      nonPerformingLoans DECIMAL(5, 2),
      liquidityRatio DECIMAL(5, 2),
      returnOnAssets DECIMAL(5, 2),
      returnOnEquity DECIMAL(5, 2),
      branchCount INT,
      employeeCount INT,
      metricsAsOf TIMESTAMP NULL,
      confidenceRating ENUM('A', 'B', 'C', 'D') DEFAULT 'C' NOT NULL,
      sourceId INT,
      headquarters VARCHAR(255),
      website TEXT,
      logoUrl TEXT,
      foundedYear INT,
      notes TEXT,
      isUnderWatch BOOLEAN DEFAULT FALSE NOT NULL,
      watchReason TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX bank_name_idx (name),
      INDEX bank_jurisdiction_idx (jurisdiction),
      INDEX bank_type_idx (bankType),
      INDEX bank_status_idx (operationalStatus),
      INDEX bank_sanctions_idx (sanctionsStatus)
    )
  `);
  console.log('commercial_banks table created');

  // Create cby_directives table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS cby_directives (
      id INT AUTO_INCREMENT PRIMARY KEY,
      directiveNumber VARCHAR(100) NOT NULL,
      title VARCHAR(500) NOT NULL,
      titleAr VARCHAR(500),
      directiveType ENUM('circular', 'regulation', 'law', 'decree', 'instruction', 'guideline', 'notice', 'amendment') NOT NULL,
      category VARCHAR(100),
      issuingAuthority ENUM('cby_aden', 'cby_sanaa', 'government', 'parliament') NOT NULL,
      issueDate TIMESTAMP NOT NULL,
      effectiveDate TIMESTAMP NULL,
      expiryDate TIMESTAMP NULL,
      summary TEXT,
      summaryAr TEXT,
      fullTextUrl TEXT,
      pdfFileKey VARCHAR(255),
      status ENUM('active', 'superseded', 'expired', 'draft') DEFAULT 'active' NOT NULL,
      supersededBy INT,
      affectedEntities JSON,
      impactLevel ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium' NOT NULL,
      sourceId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX directive_number_idx (directiveNumber),
      INDEX directive_type_idx (directiveType),
      INDEX issuing_authority_idx (issuingAuthority),
      INDEX issue_date_idx (issueDate),
      INDEX directive_status_idx (status),
      INDEX directive_category_idx (category)
    )
  `);
  console.log('cby_directives table created');

  // Create executive_profiles table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS executive_profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      nameAr VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      titleAr VARCHAR(255),
      institution VARCHAR(255) NOT NULL,
      institutionAr VARCHAR(255),
      position ENUM('governor', 'deputy_governor', 'board_member', 'director', 'minister', 'deputy_minister', 'advisor') NOT NULL,
      department VARCHAR(255),
      appointmentDate TIMESTAMP NULL,
      endDate TIMESTAMP NULL,
      isActive BOOLEAN DEFAULT TRUE NOT NULL,
      photoUrl TEXT,
      biography TEXT,
      biographyAr TEXT,
      education JSON,
      previousPositions JSON,
      policyFocus JSON,
      keyInitiatives JSON,
      email VARCHAR(320),
      phone VARCHAR(50),
      sourceId INT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX exec_name_idx (name),
      INDEX exec_institution_idx (institution),
      INDEX exec_position_idx (position),
      INDEX exec_is_active_idx (isActive)
    )
  `);
  console.log('executive_profiles table created');

  // Create partner_organizations table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS partner_organizations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      nameAr VARCHAR(255),
      acronym VARCHAR(50),
      organizationType ENUM('central_bank', 'commercial_bank', 'ministry', 'statistical_office', 'international_org', 'research_institution', 'ngo', 'other') NOT NULL,
      partnershipStatus ENUM('active', 'pending', 'suspended', 'expired') DEFAULT 'pending' NOT NULL,
      partnershipStartDate TIMESTAMP NULL,
      partnershipEndDate TIMESTAMP NULL,
      primaryContactName VARCHAR(255),
      primaryContactEmail VARCHAR(320),
      primaryContactPhone VARCHAR(50),
      totalContributions INT DEFAULT 0 NOT NULL,
      publishedContributions INT DEFAULT 0 NOT NULL,
      pendingContributions INT DEFAULT 0 NOT NULL,
      rejectedContributions INT DEFAULT 0 NOT NULL,
      agreementFileKey VARCHAR(255),
      agreementFileUrl TEXT,
      dataCategories JSON,
      logoUrl TEXT,
      website TEXT,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX partner_org_name_idx (name),
      INDEX partner_org_type_idx (organizationType),
      INDEX partner_org_status_idx (partnershipStatus)
    )
  `);
  console.log('partner_organizations table created');

  // Create partner_contributions table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS partner_contributions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      organizationId INT NOT NULL,
      submittedByUserId INT NOT NULL,
      title VARCHAR(500) NOT NULL,
      titleAr VARCHAR(500),
      description TEXT,
      dataCategory ENUM('exchange_rates', 'monetary_reserves', 'banking_statistics', 'fiscal_data', 'trade_data', 'price_indices', 'employment_data', 'sector_reports', 'regulatory_updates', 'other') NOT NULL,
      timePeriod VARCHAR(100),
      fileType ENUM('excel', 'csv', 'pdf', 'api', 'json', 'other') NOT NULL,
      fileKey VARCHAR(255),
      fileUrl TEXT,
      fileName VARCHAR(255),
      fileSize INT,
      status ENUM('draft', 'submitted', 'under_review', 'clarification_needed', 'approved', 'published', 'rejected') DEFAULT 'draft' NOT NULL,
      reviewedByUserId INT,
      reviewedAt TIMESTAMP NULL,
      reviewNotes TEXT,
      rejectionReason TEXT,
      publishedAt TIMESTAMP NULL,
      publishedDatasetId INT,
      submittedAt TIMESTAMP NULL,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX contribution_org_idx (organizationId),
      INDEX contribution_submitter_idx (submittedByUserId),
      INDEX contribution_status_idx (status),
      INDEX contribution_category_idx (dataCategory),
      INDEX contribution_submitted_at_idx (submittedAt)
    )
  `);
  console.log('partner_contributions table created');

  // Create banking_sector_metrics table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS banking_sector_metrics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date TIMESTAMP NOT NULL,
      jurisdiction ENUM('aden', 'sanaa', 'national') NOT NULL,
      totalBanks INT,
      totalAssets DECIMAL(20, 2),
      totalDeposits DECIMAL(20, 2),
      totalLoans DECIMAL(20, 2),
      loanToDepositRatio DECIMAL(5, 2),
      averageCAR DECIMAL(5, 2),
      averageNPL DECIMAL(5, 2),
      foreignReserves DECIMAL(20, 2),
      confidenceRating ENUM('A', 'B', 'C', 'D') DEFAULT 'C' NOT NULL,
      sourceId INT,
      notes TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX sector_date_idx (date),
      INDEX sector_jurisdiction_idx (jurisdiction),
      UNIQUE KEY date_jurisdiction_unique (date, jurisdiction)
    )
  `);
  console.log('banking_sector_metrics table created');

  // Create executive_dashboard_widgets table
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS executive_dashboard_widgets (
      id INT AUTO_INCREMENT PRIMARY KEY,
      executiveId INT NOT NULL,
      widgetType ENUM('kpi_card', 'chart', 'table', 'alert_feed', 'news_feed', 'calendar', 'report_generator', 'ai_assistant', 'quick_actions') NOT NULL,
      title VARCHAR(255) NOT NULL,
      titleAr VARCHAR(255),
      gridColumn INT DEFAULT 1 NOT NULL,
      gridRow INT DEFAULT 1 NOT NULL,
      gridWidth INT DEFAULT 1 NOT NULL,
      gridHeight INT DEFAULT 1 NOT NULL,
      dataSource VARCHAR(255),
      filters JSON,
      refreshInterval INT DEFAULT 300,
      isVisible BOOLEAN DEFAULT TRUE NOT NULL,
      displayOrder INT DEFAULT 0 NOT NULL,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
      INDEX widget_executive_idx (executiveId),
      INDEX widget_type_idx (widgetType)
    )
  `);
  console.log('executive_dashboard_widgets table created');

  await conn.end();
  console.log('All tables created successfully');
}

main().catch(console.error);
