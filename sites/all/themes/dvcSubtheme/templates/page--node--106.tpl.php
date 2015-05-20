<header id="navbar" role="banner" class="<?php print $navbar_classes; ?>">
  <div class="container">
    
      <div class="navbar-header col-xs-25">
        
        <?php if ($logo): ?>
        <a class="logo navbar-btn pull-left" href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>">
          <img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" />
        </a>
        <?php endif; ?>
  
        <!-- .btn-navbar is used as the toggle for collapsed navbar content -->
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
        <div class="navbar-collapse collapse col-xs-75">
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

<div class="main-container container-fluid">

  <div class="row">

    <section<?php/* print $content_column_class;*/ ?>>
      <div class="content-wrapper-bg-opacity clearfix">
        <div class="content-wrapper-bg">
        <?php if (!empty($page['highlighted'])): ?>
          <div class="highlighted jumbotron"><?php print render($page['highlighted']); ?></div>
        <?php endif; ?>
        <a id="main-content"></a>
        <?php print $messages; ?>
        <?php if (!empty($tabs)): ?>
          <?php print render($tabs); ?>
        <?php endif; ?>
        <?php if (!empty($page['help'])): ?>
          <?php print render($page['help']); ?>
        <?php endif; ?>
        <?php if (!empty($action_links)): ?>
          <ul class="action-links"><?php print render($action_links); ?></ul>
        <?php endif; ?>
        <?php print render($page['content']); ?>
        <div class="news-block-region container">
          <?php if (!empty($page['news_block'])): ?>
            <?php print render($page['news_block']); ?>
          <?php endif; ?>
        </div>
        </div>
      </div>
    </section>

    <?php if (!empty($page['sidebar_second'])): ?>
      <aside class="col-xs-3" role="complementary">
        <?php print render($page['sidebar_second']); ?>
      </aside>  <!-- /#sidebar-second -->
    <?php endif; ?>

  </div>
</div>
<footer class="footer container-fluid">
  <div class="container">
    <div class="row">
      <?php print render($page['footer']); ?>
    </div>
  </div>
</footer>
