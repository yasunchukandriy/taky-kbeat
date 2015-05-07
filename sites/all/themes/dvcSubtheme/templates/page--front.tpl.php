<header id="navbar" role="banner" class="<?php print $navbar_classes; ?>">
  <div class="container">
    
      <div class="navbar-header col-sm-3">
        
        <?php if ($logo): ?>
        <a class="logo navbar-btn pull-left" href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>">
          <img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" />
        </a>
        <?php endif; ?>
  
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">
          <span class="sr-only">Toggle navigation</span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
          <span class="icon-bar"></span>
        </button>
      </div>
      
      <?php if (!empty($page['prenavigation'])): ?>
        <?php print render($page['prenavigation']); ?>
      <?php endif; ?>
      
      
      
      <?php if (!empty($primary_nav) || !empty($secondary_nav) || !empty($page['navigation'])): ?>
        <div class="navbar-collapse collapse col-sm-9">
          <nav role="navigation">
            <?php if (!empty($page['navigation'])): ?>
              <?php print render($page['navigation']); ?>
            <?php endif; ?>
            <?php if (!empty($primary_nav)): ?>
              <?php print render($primary_nav); ?>
            <?php endif; ?>
            <?php if (!empty($secondary_nav)): ?>
              <?php print render($secondary_nav); ?>
            <?php endif; ?>
          </nav>
        </div>
      <?php endif; ?>
    
  </div>
</header>

<div class="main-container">

  <div class="row">

    <section<?php print $content_column_class; ?>>
      <div class="content-wrapper-bg-opacity clearfix">
        <div class="content-wrapper-bg">
        <?php if (!empty($page['highlighted'])): ?>
          <div class="highlighted-region-class">
            <div class="highlighted jumbotron container">
            <?php print $messages; ?>
            <?php print render($page['highlighted']); ?></div>
          </div>
        <?php endif; ?>
        <a id="main-content"></a>
        <?php if (!empty($page['content'])): ?>
          <div class="content-region-class">
           <div class="content container"><?php print render($page['content']); ?></div>
          </div>
        <?php endif; ?>
        <?php if (!empty($page['news_block'])): ?>
          <div class="content-region-class">
            <div class="news-block container"><?php print render($page['news_block']); ?></div>
          </div>
        <?php endif; ?>
        </div>
      </div>
    </section>

  </div>
</div>
<footer class="footer container-fluid">
  <div class="container">
    <div class="col-sm-12">
      <?php print render($page['footer']); ?>
    </div>
  </div>
</footer>
